import clsx from 'clsx';
import type { CSSProperties } from 'react';

// Pick by what sits behind the bar:
//   light mode: gray-50 on white, white on gray-50 or gray-100
//   dark mode:  gray-850 on gray-950 (as on /mcp, /protect, and /agents), gray-950 on gray-900, gray-900 on black
// The edges are the surface with black mixed in; for these grays, mixing in oklab steps the
// OKLCH lightness down by a fixed amount (0.1 and 0.04 light, 0.06 and 0.02 dark).
const TONES = {
  white: { base: 'var(--color-white)', kind: 'light', edge: '10%', edgeMid: '4%' },
  'gray-50': { base: 'var(--color-gray-50)', kind: 'light', edge: '10.2%', edgeMid: '4.1%' },
  'gray-850': { base: 'var(--color-gray-850)', kind: 'dark', edge: '21.8%', edgeMid: '7.3%' },
  'gray-900': { base: 'var(--color-gray-900)', kind: 'dark', edge: '24%', edgeMid: '8%' },
  'gray-950': { base: 'var(--color-gray-950)', kind: 'dark', edge: '31.9%', edgeMid: '10.6%' },
} as const;

export type GlassTone = keyof typeof TONES;

const BEVEL = {
  light: { top: '70%', end: '45%' },
  dark: { top: '22%', end: '12%' },
};

const SHADOW = {
  light: ['0px 8px 16px rgb(0 0 0 / 0.06)', '0 2px 4px -1px rgb(0 0 0 / 0.08)', '0 1px 1px -0.5px rgb(0 0 0 / 0.16)'],
  dark: ['0px 8px 16px rgb(0 0 0 / 0.3)', '0 2px 4px -1px rgb(0 0 0 / 0.4)', '0 1px 1px -0.5px rgb(0 0 0 / 0.5)'],
};

function toneColors(tone: GlassTone, scheme: keyof typeof BEVEL) {
  const { base, kind, edge, edgeMid } = TONES[tone];
  const shade = (amount: string) => `color-mix(in oklab, ${base}, var(--color-black) ${amount})`;
  const highlight = (amount: string) => `color-mix(in oklab, var(--color-white) ${amount}, ${base})`;
  return {
    fill: `color-mix(in oklab, ${base} 85%, transparent)`,
    ink: kind === 'light' ? 'var(--color-gray-700)' : 'var(--color-gray-100)',
    'action-bg': kind === 'light' ? 'var(--color-gray-800)' : 'var(--color-white)',
    'action-ink': kind === 'light' ? 'var(--color-white)' : 'var(--color-gray-950)',
    shadow: SHADOW[scheme].join(', '),
    border: `linear-gradient(to right, ${shade(edge)}, ${shade(edgeMid)} 50% 80%, ${shade(edge)}) border-box`,
    'inner-border': `linear-gradient(to bottom, ${highlight(BEVEL[scheme].top)}, transparent 30% 50%, ${highlight(BEVEL[scheme].end)}) border-box`,
  };
}

export function glassStyle(tone: GlassTone | { light: GlassTone; dark: GlassTone }) {
  if (typeof tone === 'string') {
    tone = { light: tone, dark: tone };
  }
  const style: Record<string, string> = {};
  for (const scheme of ['light', 'dark'] as const) {
    for (const [key, value] of Object.entries(toneColors(tone[scheme], scheme))) {
      style[`--glass-${key}-${scheme}`] = value;
    }
  }
  return style as CSSProperties;
}

export const GLASS_SCHEME = clsx(
  '[--glass-fill:var(--glass-fill-light)] dark:[--glass-fill:var(--glass-fill-dark)]',
  '[--glass-ink:var(--glass-ink-light)] dark:[--glass-ink:var(--glass-ink-dark)]',
  '[--glass-action-bg:var(--glass-action-bg-light)] dark:[--glass-action-bg:var(--glass-action-bg-dark)]',
  '[--glass-action-ink:var(--glass-action-ink-light)] dark:[--glass-action-ink:var(--glass-action-ink-dark)]',
  '[--glass-shadow:var(--glass-shadow-light)] dark:[--glass-shadow:var(--glass-shadow-dark)]',
  '[--glass-border:var(--glass-border-light)] dark:[--glass-border:var(--glass-border-dark)]',
  '[--glass-inner-border:var(--glass-inner-border-light)] dark:[--glass-inner-border:var(--glass-inner-border-dark)]',
);

// The surface's outer edge and inner bevel, on a box with `relative isolate` and a `--glass-r` radius.
export const GLASS_EDGES = clsx(
  'before:absolute before:inset-px before:-z-15 before:rounded-[calc(var(--glass-r)-1px)] before:border before:border-transparent',
  'before:[background:var(--glass-inner-border)] before:[mask:linear-gradient(#fff_0_0)_padding-box_exclude,linear-gradient(#fff_0_0)]',
  'after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:border after:border-transparent',
  'after:[background:var(--glass-border)] after:[mask:linear-gradient(#fff_0_0)_padding-box_exclude,linear-gradient(#fff_0_0)]',
);

// Fallback for browsers without text-box: empty table pseudo-elements pull the box in by the
// font's own trims (see TRIM).
export const trimToCapHeight = clsx(
  'block [text-box:trim-both_cap_alphabetic]',
  'not-supports-[text-box:trim-both_cap_alphabetic]:before:-mb-[calc(var(--trim-top)*1em)] not-supports-[text-box:trim-both_cap_alphabetic]:before:table',
  'not-supports-[text-box:trim-both_cap_alphabetic]:after:-mt-[calc(var(--trim-bottom)*1em)] not-supports-[text-box:trim-both_cap_alphabetic]:after:table',
);
