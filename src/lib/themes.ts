/** SignaCon visual identity and light/dark mode preferences. */

export const THEME_ID = 'signacon' as const;
export type ThemeId = typeof THEME_ID;
export const DEFAULT_THEME: ThemeId = THEME_ID;

export const MODES = ['light', 'dark'] as const;
export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = 'light';
export const MODE_STORAGE_KEY = 'signacon.mode';
export const LEGACY_MODE_STORAGE_KEY = 'wacrm.mode';

export function isMode(value: unknown): value is Mode {
  return (
    typeof value === 'string' &&
    (MODES as ReadonlyArray<string>).includes(value)
  );
}
