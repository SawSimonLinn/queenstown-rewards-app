/**
 * Queenstown Rewards is a light-only app (see AGENTS.md / redesign brief):
 * it must never switch appearance based on the device's dark-mode setting.
 * This hook always reports 'light' so every consumer of `useColorScheme`
 * (directly or via `useTheme`) renders the light palette, on web too.
 */
export function useColorScheme(): 'light' {
  return 'light';
}
