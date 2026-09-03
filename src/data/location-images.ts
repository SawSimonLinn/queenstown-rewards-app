// Manifest of authorised, locally stored Queenstown photography, keyed by
// RestaurantLocation.id. No approved local images exist for any location
// yet (see assets/locations/<slug>/ in the redesign brief) — every entry is
// intentionally empty so the app falls back to the brand-colour
// FoodImagePlaceholder rather than a photograph. Add `require(...)` sources
// here (never a remote/hotlinked URL, never AI-generated imagery) as real
// photography is supplied, and the hero and gallery will start rendering
// automatically — no other code changes needed.

import type { ImageSourcePropType } from 'react-native';

export type LocationImageManifestEntry = {
  /** Large hero image shown at the top of the location detail screen. */
  hero?: ImageSourcePropType;
  /** Official restaurant logo, shown over the hero when available. */
  logo?: ImageSourcePropType;
  /** Horizontally scrolling gallery images. Empty hides the gallery section. */
  gallery: ImageSourcePropType[];
};

export const LOCATION_IMAGE_MANIFEST: Record<string, LocationImageManifestEntry> = {
  'queenstown-public-house': { gallery: [] },
  'queenstown-bistro-utc': { gallery: [] },
  'queenstown-village-la-jolla': { gallery: [] },
  'queenstown-del-mar': { gallery: [] },
  'dunedin-north-park': { gallery: [] },
  'raglan-public-house': { gallery: [] },
  'bare-back-grill': { gallery: [] },
};

export function getLocationImages(locationId: string): LocationImageManifestEntry {
  return LOCATION_IMAGE_MANIFEST[locationId] ?? { gallery: [] };
}
