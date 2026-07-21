import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  LEGACY_MODE_STORAGE_KEY,
  MODE_STORAGE_KEY,
  THEME_ID,
} from './themes';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('SignaCon branding', () => {
  it('keeps the official logo geometry and colours locally', () => {
    const logo = read('public/brand/logo-signacon.svg').toLowerCase();
    expect(logo).toContain('viewbox="0 0 322.05 56.52"');
    expect(logo).toContain('#2a2a2a');
    expect(logo).toContain('#e09b1d');
    expect(logo).not.toContain('signacon.com.br');
  });

  it('derives accessible dark and compact variants from the official paths', () => {
    const darkLogo = read('public/brand/logo-signacon-dark.svg').toLowerCase();
    const mark = read('public/brand/mark-signacon.svg').toLowerCase();
    expect(darkLogo).toContain('#ffffff');
    expect(darkLogo).toContain('#e09b1d');
    expect(mark).toContain('viewbox="265.43 0 56.62 56.52"');
    expect(mark.match(/<path/g)).toHaveLength(3);
  });

  it('uses one fixed SignaCon theme with light as the new-user default', () => {
    expect(THEME_ID).toBe('signacon');
    expect(DEFAULT_THEME).toBe('signacon');
    expect(DEFAULT_MODE).toBe('light');
    expect(MODE_STORAGE_KEY).toBe('signacon.mode');
    expect(LEGACY_MODE_STORAGE_KEY).toBe('wacrm.mode');
  });

  it('uses the SignaCon product name and local mark in metadata', () => {
    const layout = read('src/app/layout.tsx');
    const manifest = read('src/app/manifest.ts');
    expect(layout).toContain("default: 'SignaCon CRM'");
    expect(layout).toContain("'/brand/mark-signacon.svg'");
    expect(layout).toContain("manifest: '/manifest.webmanifest'");
    expect(manifest).toContain("name: 'SignaCon CRM'");
    expect(manifest).toContain("theme_color: '#e09b1d'");
    expect(layout).not.toContain('SC WACRM');
  });
});
