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
