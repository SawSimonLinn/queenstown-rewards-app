import { supabase } from '@/lib/supabase';
import { mapProfileRow, type ProfileRow } from '@/lib/supabase/mappers';
import type { Profile } from '@/types';

export async function getMyProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data as ProfileRow) : null;
}
