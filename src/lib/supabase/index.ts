import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.'
  );
}

/**
 * On native, AsyncStorage is always safe to use directly. On web, Expo
 * Router's static output pre-renders this module in Node.js (no `window`),
 * so the storage adapter must not touch `window.localStorage` until it's
 * actually called in a real browser — otherwise the whole dev server
 * process crashes with "window is not defined" during static rendering.
 */
const webSafeStorage = {
  getItem: async (key: string): Promise<string | null> =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const supabaseAuthStorage = Platform.OS === 'web' ? webSafeStorage : AsyncStorage;

// Only the public anon key is used here — never the service-role key, which
// must stay server-side (Supabase Edge Functions / secure DB functions).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
