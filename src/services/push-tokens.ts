import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

type PushPlatform = 'ios' | 'android' | 'web';

function getPushPlatform(): PushPlatform {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
}

/** Stores this device's push token against the signed-in customer. RLS (Phase 7) restricts this to the customer's own rows. */
export async function registerPushToken(token: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not signed in.');

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { profile_id: userData.user.id, token, platform: getPushPlatform() },
      { onConflict: 'profile_id,token' }
    );
  if (error) throw error;
}

export async function unregisterPushToken(token: string): Promise<void> {
  const { error } = await supabase.from('push_tokens').delete().eq('token', token);
  if (error) throw error;
}
