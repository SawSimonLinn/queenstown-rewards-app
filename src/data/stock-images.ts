// Generic, royalty-free stock photography (Unsplash) used as a realistic
// stand-in wherever real, authorised photography for a specific dish or
// location has not been supplied yet. These do NOT depict any actual
// Queenstown Hospitality location, dish, or menu item — swap them out for
// real photography as it becomes available (see src/data/location-images.ts
// for locations, or the `imageUrl` field on campaigns/specials for the rest).

export const STOCK_BURGER_IMAGES = [
  require('../../assets/stock/burger-1.jpg'),
  require('../../assets/stock/burger-2.jpg'),
  require('../../assets/stock/burger-3.jpg'),
];

export const STOCK_SPECIAL_IMAGES = [
  require('../../assets/stock/food-plate-1.jpg'),
  require('../../assets/stock/drinks-1.jpg'),
  require('../../assets/stock/restaurant-bar.jpg'),
];

export const STOCK_LOCATION_HERO_IMAGES = [
  require('../../assets/stock/pub-interior-1.jpg'),
  require('../../assets/stock/pub-interior-2.jpg'),
  require('../../assets/stock/restaurant-bar.jpg'),
  require('../../assets/stock/restaurant-tables.jpg'),
];

export const STOCK_LOCATION_GALLERY_IMAGES = [
  require('../../assets/stock/pub-interior-1.jpg'),
  require('../../assets/stock/pub-interior-2.jpg'),
  require('../../assets/stock/restaurant-bar.jpg'),
  require('../../assets/stock/restaurant-tables.jpg'),
  require('../../assets/stock/food-plate-1.jpg'),
  require('../../assets/stock/drinks-1.jpg'),
];

/** Deterministically picks a stock image from a list based on a string id, so the same location/campaign always shows the same photo. */
export function pickStockImage<T>(images: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return images[Math.abs(hash) % images.length];
}
