// Bridges the two location datasets: src/data/locations.ts (rich, local,
// slug ids — what the rest of the app displays) and Supabase's
// public.locations (uuid ids — what profiles.preferred_location_id's FK
// actually points at). See supabase/migrations/20260903093000_add_slug_to_locations.sql.

import { supabase } from '@/lib/supabase';

type SlugMap = { slugToId: Map<string, string>; idToSlug: Map<string, string> };

let cachedSlugMap: Promise<SlugMap> | null = null;

async function loadSlugMap(): Promise<SlugMap> {
  const { data, error } = await supabase.from('locations').select('id, slug');
  if (error) throw error;

  const slugToId = new Map<string, string>();
  const idToSlug = new Map<string, string>();
  for (const row of data as { id: string; slug: string }[]) {
    slugToId.set(row.slug, row.id);
    idToSlug.set(row.id, row.slug);
  }
  return { slugToId, idToSlug };
}

function getSlugMap(): Promise<SlugMap> {
  if (!cachedSlugMap) {
    cachedSlugMap = loadSlugMap().catch((error) => {
      cachedSlugMap = null;
      throw error;
    });
  }
  return cachedSlugMap;
}

/** Local RestaurantLocation id (slug) -> Supabase public.locations.id (uuid). */
export async function getSupabaseLocationId(slug: string): Promise<string | null> {
  const { slugToId } = await getSlugMap();
  return slugToId.get(slug) ?? null;
}

/** Supabase public.locations.id (uuid) -> local RestaurantLocation id (slug). */
export async function getSlugForSupabaseLocationId(id: string): Promise<string | null> {
  const { idToSlug } = await getSlugMap();
  return idToSlug.get(id) ?? null;
}
