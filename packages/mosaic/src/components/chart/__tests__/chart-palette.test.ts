import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { assertChartPalette, oklchToSrgb8, type PaletteMode, type Srgb8 } from './palette-checks';

const tokens = readFileSync(resolve(import.meta.dirname, '../../../tokens.stylex.ts'), 'utf8');

const OKLCH = String.raw`oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)`;
const TOKEN = new RegExp(String.raw`'--cl-color-chart-(\d+)': 'light-dark\(${OKLCH}, ${OKLCH}\)'`, 'g');

function palette(mode: PaletteMode): Srgb8[] {
  const slots = [...tokens.matchAll(TOKEN)];
  return slots.map(([, , ...values]) => {
    const [l, c, h] = (mode === 'light' ? values.slice(0, 3) : values.slice(3)).map(Number);
    return oklchToSrgb8(l, c, h);
  });
}

const white = oklchToSrgb8(1, 0, 0);
// `--cl-color-surface` in dark mode: 5% of the white neutral mixed in OKLab into the 0.16 page.
const darkSurface = oklchToSrgb8(0.95 * 0.16 + 0.05, 0, 0);
const darkPage = oklchToSrgb8(0.16, 0, 0);

describe('chart palette tokens', () => {
  it('defines six slots, in order, each as one light-dark value', () => {
    expect([...tokens.matchAll(TOKEN)].map(([, slot]) => slot)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('passes the data-viz checks in light mode on the surface', () => {
    expect(() => assertChartPalette(palette('light'), 'light', white)).not.toThrow();
  });

  it('passes the data-viz checks in dark mode on the surface and on the page', () => {
    expect(() => assertChartPalette(palette('dark'), 'dark', darkSurface)).not.toThrow();
    expect(() => assertChartPalette(palette('dark'), 'dark', darkPage)).not.toThrow();
  });

  it('rejects the original story hues, which fail the band and chroma checks', () => {
    const channel = (value: string, at: number) => parseInt(value.slice(at, at + 2), 16) / 255;
    const hex = (value: string): Srgb8 => [channel(value, 0), channel(value, 2), channel(value, 4)];
    const original = ['7c3aed', '0ea5e9', 'f97316', '06b6d4', 'eab308', '64748b'].map(hex);

    expect(() => assertChartPalette(original, 'light', white)).toThrow(/slot 5: lightness .*\n.*slot 6: chroma/s);
  });
});
