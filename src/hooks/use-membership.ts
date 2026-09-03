import { useMembershipContext } from '@/lib/membership';

export type { MembershipState } from '@/lib/membership';

/** Burger Club membership, shared via MembershipProvider (see src/app/_layout.tsx). */
export function useMembership() {
  const { state, retry, refresh, isRefreshing, refreshError, join } = useMembershipContext();
  return { state, retry, refresh, isRefreshing, refreshError, join };
}
