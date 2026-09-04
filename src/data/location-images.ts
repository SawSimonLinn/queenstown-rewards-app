// Manifest of Queenstown photography, keyed by RestaurantLocation.id. No
// approved real photos exist for any location yet, so each entry falls back
// to generic stock photography (src/data/stock-images.ts) rather than a
// bare illustration. These are NOT real photos of these businesses — replace
// an entry's `hero`/`gallery`/`logo` with a real `require(...)` (never a
// remote/hotlinked URL, never AI-generated imagery) as authorised photography
// is supplied, and it will start rendering automatically — no other code
// changes needed.

import type { ImageSourcePropType } from 'react-native';

import {
  pickStockImage,
  STOCK_LOCATION_GALLERY_IMAGES,
  STOCK_LOCATION_HERO_IMAGES,
} from '@/data/stock-images';

export type LocationImageManifestEntry = {
  /** Large hero image shown at the top of the location detail screen. */
  hero?: ImageSourcePropType;
  /** Official restaurant logo, shown over the hero when available. */
  logo?: ImageSourcePropType;
  /** Horizontally scrolling gallery images. Empty hides the gallery section. */
  gallery: ImageSourcePropType[];
};

const LOCATION_IDS = [
  'queenstown-public-house',
  'queenstown-bistro-utc',
  'queenstown-village-la-jolla',
  'queenstown-del-mar',
  'dunedin-north-park',
  'raglan-public-house',
  'bare-back-grill',
];

export const LOCATION_IMAGE_MANIFEST: Record<string, LocationImageManifestEntry> =
  Object.fromEntries(
    LOCATION_IDS.map((id) => [
      id,
      {
        hero: pickStockImage(STOCK_LOCATION_HERO_IMAGES, id),
        gallery: STOCK_LOCATION_GALLERY_IMAGES,
      },
    ])
  );

export function getLocationImages(locationId: string): LocationImageManifestEntry {
  return LOCATION_IMAGE_MANIFEST[locationId] ?? { gallery: [] };
}
