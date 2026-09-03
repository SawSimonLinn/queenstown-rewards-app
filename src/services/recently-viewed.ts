// Signed-in customers' Location Details view history, backed by
// public.recently_viewed_locations (Phase 11 —
// supabase/migrations/20260903096000_create_recently_viewed_locations.sql).
// Guests get the equivalent local history — see lib/recently-viewed-guest.ts.

import { supabase } from '@/lib/supabase';
import { getSlugForSupabaseLocationId, getSupabaseLocationId } from '@/services/locations';

const MAX_RECENTLY_VIEWED = 5;

/** Records (or bumps) a view of `slug` for the signed-in customer. No-ops if the slug has no Supabase-side location row. */
export async function recordLocationView(slug: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return;

  const locationId = await getSupabaseLocationId(slug);
  if (!locationId) return;

  const { error } = await supabase
    .from('recently_viewed_locations')
    .upsert(
      { profile_id: userData.user.id, location_id: locationId, viewed_at: new Date().toISOString() },
      { onConflict: 'profile_id,location_id' }
    );
  if (error) throw error;

  await trimToMostRecent(userData.user.id);
}

/** Keeps the table small — only the read side's MAX_RECENTLY_VIEWED rows matter, so drop anything older. */
async function trimToMostRecent(profileId: string): Promise<void> {
  const { data, error } = await supabase
    .from('recently_viewed_locations')
    .select('location_id')
    .eq('profile_id', profileId)
    .order('viewed_at', { ascending: false })
    .range(MAX_RECENTLY_VIEWED, MAX_RECENTLY_VIEWED + 50);
  if (error || !data || data.length === 0) return;

  const staleIds = (data as { location_id: string }[]).map((row) => row.location_id);
  await supabase
    .from('recently_viewed_locations')
    .delete()
    .eq('profile_id', profileId)
    .in('location_id', staleIds);
}

/** Local RestaurantLocation ids (slugs), most recently viewed first, capped at MAX_RECENTLY_VIEWED. */
export async function getRecentlyViewedLocationSlugs(): Promise<string[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('recently_viewed_locations')
    .select('location_id')
    .eq('profile_id', userData.user.id)
    .order('viewed_at', { ascending: false })
    .limit(MAX_RECENTLY_VIEWED);
  if (error) throw error;

  const slugs = await Promise.all(
    (data as { location_id: string }[]).map((row) => getSlugForSupabaseLocationId(row.location_id))
  );
  return slugs.filter((slug): slug is string => slug !== null);
}
