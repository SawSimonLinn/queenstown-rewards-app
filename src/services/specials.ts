import {
  mapLocationRow,
  mapSpecialRow,
  type LocationRow,
  type SpecialRow,
} from '@/lib/supabase/mappers';
import { supabase } from '@/lib/supabase';
import type { Location, Special } from '@/types';

export async function getSpecials(): Promise<Special[]> {
  const { data, error } = await supabase
    .from('specials')
    .select('*, special_locations(location_id)')
    .order('start_date', { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const locationIds = (row.special_locations ?? []).map(
      (link: { location_id: string }) => link.location_id
    );
    return mapSpecialRow(row as SpecialRow, locationIds);
  });
}

export interface SpecialDetail {
  special: Special;
  locations: Location[];
}

export async function getSpecialDetail(specialId: string): Promise<SpecialDetail | null> {
  const { data: specialRow, error: specialError } = await supabase
    .from('specials')
    .select('*')
    .eq('id', specialId)
    .maybeSingle();
  if (specialError) throw specialError;
  if (!specialRow) return null;

  const { data: locationRows, error: locationsError } = await supabase
    .from('special_locations')
    .select('locations(*)')
    .eq('special_id', specialId);
  if (locationsError) throw locationsError;

  const locations = ((locationRows ?? []) as unknown as { locations: LocationRow | null }[])
    .map((row) => row.locations)
    .filter((location): location is LocationRow => location != null)
    .map(mapLocationRow);

  return {
    special: mapSpecialRow(
      specialRow as SpecialRow,
      locations.map((location) => location.id)
    ),
    locations,
  };
}

export type SpecialInput = {
  title: string;
  description: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
};

function toSpecialRowInput(input: SpecialInput) {
  return {
    title: input.title,
    description: input.description,
    image_url: input.imageUrl,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}

/** Staff/admin only — enforced by RLS ("Staff and admins can manage specials"). */
export async function createSpecial(input: SpecialInput): Promise<Special> {
  const { data, error } = await supabase
    .from('specials')
    .insert(toSpecialRowInput(input))
    .select('*')
    .single();
  if (error) throw error;
  return mapSpecialRow(data as SpecialRow);
}

export async function updateSpecial(specialId: string, input: SpecialInput): Promise<Special> {
  const { data, error } = await supabase
    .from('specials')
    .update(toSpecialRowInput(input))
    .eq('id', specialId)
    .select('*')
    .single();
  if (error) throw error;
  return mapSpecialRow(data as SpecialRow);
}

export async function deleteSpecial(specialId: string): Promise<void> {
  const { error } = await supabase.from('specials').delete().eq('id', specialId);
  if (error) throw error;
}

/** Replaces every special_locations row for this special with `locationIds`. Empty means "all participating locations". */
export async function replaceSpecialLocations(
  specialId: string,
  locationIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('special_locations')
    .delete()
    .eq('special_id', specialId);
  if (deleteError) throw deleteError;

  if (locationIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('special_locations')
    .insert(locationIds.map((locationId) => ({ special_id: specialId, location_id: locationId })));
  if (insertError) throw insertError;
}
