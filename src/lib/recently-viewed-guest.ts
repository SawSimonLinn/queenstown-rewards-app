// Guest (signed-out) Location Details view history, stored locally only —
// see src/services/recently-viewed.ts for the signed-in, Supabase-backed
// equivalent. Never merged into a customer's account history on login (the
// Home redesign brief is explicit that this isn't safe to do automatically
// here), so this stays guest-only, keyed by a single fixed storage key.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qr:recently-viewed-locations';
const MAX_RECENTLY_VIEWED = 5;

type GuestRecentlyViewedEntry = { slug: string; viewedAt: string };

async function readEntries(): Promise<GuestRecentlyViewedEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Local RestaurantLocation ids (slugs), most recently viewed first. */
export async function getGuestRecentlyViewedSlugs(): Promise<string[]> {
  const entries = await readEntries();
  return entries.map((entry) => entry.slug);
}

/** Moves `slug` to the front (deduping) and caps the list at MAX_RECENTLY_VIEWED. */
export async function recordGuestLocationView(slug: string): Promise<void> {
  const entries = await readEntries();
  const next = [
    { slug, viewedAt: new Date().toISOString() },
    ...entries.filter((entry) => entry.slug !== slug),
  ].slice(0, MAX_RECENTLY_VIEWED);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
