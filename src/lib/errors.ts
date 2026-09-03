/**
 * Best-effort human-readable message for an unknown thrown value — handles
 * real `Error`s and Supabase's `PostgrestError`-shaped objects (which do
 * extend `Error`, but this stays defensive in case a raw object ever slips
 * through) alike.
 */
export function getErrorMessage(error: unknown, fallback = 'Please try again.'): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

/**
 * `console.error(error)` alone often prints as a bare "Object" in the RN/
 * Metro console for PostgrestError-shaped values — pull out the fields that
 * actually explain what went wrong (message/code from PostgREST; hint is
 * where Postgres puts the actionable fix, e.g. for RLS/permission errors).
 */
export function describeError(error: unknown): string {
  if (error && typeof error === 'object') {
    const { message, code, details, hint } = error as Record<string, unknown>;
    return JSON.stringify({ message, code, details, hint });
  }
  return String(error);
}
