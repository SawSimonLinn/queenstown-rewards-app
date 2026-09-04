import { Brand, StaffBrand, type BrandPalette } from '@/constants/theme';
import { useProfileContext } from '@/lib/profile';

/**
 * The active brand palette — `StaffBrand` for staff/admin accounts,
 * `Brand` for everyone else (including signed-out visitors). Shared UI
 * primitives (Button, StatusBadge, AppHeader, ThemedText, the tab bar) read
 * this instead of importing `Brand` directly, so the app's accent color
 * follows the signed-in role everywhere those primitives are used.
 */
export function useBrand(): BrandPalette {
  const { profile } = useProfileContext();
  const isStaff = !!profile && profile.role !== 'customer';
  return isStaff ? StaffBrand : Brand;
}
