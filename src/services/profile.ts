import { supabase } from '@/lib/supabase';
import { mapProfileRow, type ProfileRow } from '@/lib/supabase/mappers';
import type { Profile } from '@/types';

export async function getMyProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  if (data) return mapProfileRow(data as ProfileRow);

  // Defensive fallback: the on_auth_user_created trigger creates this row on
  // every signup, so a missing row here should be rare (e.g. a row created
  // before that trigger existed). See ensure_profile() migration.
  const { data: ensured, error: ensureError } = await supabase.rpc('ensure_profile');
  if (ensureError) throw ensureError;
  return ensured ? mapProfileRow(ensured as ProfileRow) : null;
}

export type UpdateMyProfilePatch = {
  fullName?: string;
  preferredLocationId?: string | null;
  onboardingCompletedAt?: string;
};

export async function updateMyProfile(patch: UpdateMyProfilePatch): Promise<Profile> {
  const update: Record<string, unknown> = {};
  if (patch.fullName !== undefined) update.full_name = patch.fullName;
  if (patch.preferredLocationId !== undefined) update.preferred_location_id = patch.preferredLocationId;
  if (patch.onboardingCompletedAt !== undefined) update.onboarding_completed_at = patch.onboardingCompletedAt;

  // PostgREST rejects an UPDATE with no filter outright ("UPDATE requires a
  // WHERE clause") — it won't infer one from RLS, even though the "Users can
  // update their own profile" policy would scope it to this row regardless.
  // So this .eq is belt-and-suspenders: PostgREST's required filter, backed
  // by RLS as the actual security boundary.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be signed in to do that.');

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProfileRow(data as ProfileRow);
}
