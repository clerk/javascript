import clsx from 'clsx';
import type { CSSProperties } from 'react';

// Pick by what sits behind the bar:
//   light mode: gray-50 on white, white on gray-50 or gray-100
//   dark mode:  gray-800 on gray-950 (as on /mcp, /protect, and /agents), gray-950 on gray-900, gray-900 on black
// The edges are the surface with black mixed in; for these grays, mixing in oklab steps the
// OKLCH lightness down by a fixed amount (0.1 and 0.04 light, 0.06 and 0.02 dark).
const TONES = {
  white: { base: 'var(--color-white)', kind: 'light', edge: '10%', edgeMid: '4%' },
  'gray-50': { base: 'var(--color-gray-50)', kind: 'light', edge: '10.2%', edgeMid: '4.1%' },
  'gray-800': { base: 'var(--color-gray-800)', kind: 'dark', edge: '21.8%', edgeMid: '7.3%' },
  'gray-850': { base: 'var(--color-gray-850)', kind: 'dark', edge: '21.8%', edgeMid: '7.3%' },
  'gray-900': { base: 'var(--color-gray-900)', kind: 'dark', edge: '24%', edgeMid: '8%' },
  'gray-950': { base: 'var(--color-gray-950)', kind: 'dark', edge: '31.9%', edgeMid: '10.6%' },
} as const;

export type GlassTone = keyof typeof TONES;

const BEVEL = {
  light: { top: '70%', end: '45%' },
  dark: { top: '22%', end: '12%' },
};

// Light is hot (warm white on top), shade is cold (violet underside and shadows), at about half the brief's chroma.
const LIGHT = {
  light: { hot: 'oklch(0.995 0.006 85)', cold: 'oklch(0.985 0.008 292)' },
  dark: { hot: 'oklch(0.97 0.012 80)', cold: 'oklch(0.8 0.04 292)' },
};

// The outer rim darkens toward the bottom, where the surface turns away from the light.
const RIM = {
  light: { underside: 'oklch(0.5 0.035 288 / 0.22)' },
  dark: { underside: 'oklch(0.08 0.025 275 / 0.45)' },
};

const SHADOW = {
  light: [
    '0px 8px 16px oklch(0.45 0.03 290 / 0.07)',
    '0 2px 4px -1px oklch(0.35 0.035 285 / 0.08)',
    '0 1px 1px -0.5px oklch(0.25 0.04 280 / 0.12)',
  ],
  dark: [
    '0px 8px 16px oklch(0.1 0.015 282 / 0.3)',
    '0 2px 4px -1px oklch(0.08 0.02 278 / 0.4)',
    '0 1px 1px -0.5px oklch(0.05 0.02 275 / 0.5)',
  ],
};

const PRISM = {
  light: { warm: 'oklch(0.9 0.04 345 / 0.14)', cool: 'oklch(0.9 0.035 215 / 0.14)' },
  dark: { warm: 'oklch(0.5 0.06 345 / 0.16)', cool: 'oklch(0.5 0.05 215 / 0.16)' },
};

function toneColors(tone: GlassTone, scheme: keyof typeof BEVEL) {
  const { base, kind, edge, edgeMid } = TONES[tone];
  const shade = (amount: string) => `color-mix(in oklab, ${base}, var(--color-black) ${amount})`;
  const highlight = (light: string, amount: string) => `color-mix(in oklab, ${light} ${amount}, ${base})`;
  return {
    fill: `color-mix(in oklab, ${base} 85%, transparent)`,
    ink: kind === 'light' ? 'var(--color-gray-700)' : 'var(--color-gray-100)',
    'action-bg': kind === 'light' ? 'var(--color-gray-800)' : 'var(--color-white)',
    'action-ink': kind === 'light' ? 'var(--color-white)' : 'var(--color-gray-950)',
    shadow: SHADOW[scheme].join(', '),
    border: `linear-gradient(to bottom, transparent 40%, ${RIM[scheme].underside}) border-box, ${
      scheme === 'light'
        ? `linear-gradient(to right, ${shade('6%')}, ${shade('2.5%')} 50% 80%, ${shade('6%')}) border-box`
        : `linear-gradient(to right, ${shade(edge)}, ${shade(edgeMid)} 50% 80%, ${shade(edge)}) border-box`
    }`,
    'inner-border': `linear-gradient(to bottom, ${highlight(LIGHT[scheme].hot, BEVEL[scheme].top)}, transparent 30% 50%, ${highlight(LIGHT[scheme].cold, BEVEL[scheme].end)}) border-box`,
    prism: `linear-gradient(to right, ${PRISM[scheme].warm}, transparent 30% 70%, ${PRISM[scheme].cool}) border-box`,
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
  '[--glass-prism:var(--glass-prism-light)] dark:[--glass-prism:var(--glass-prism-dark)]',
);

// A faint warm-to-cool ring along the bottom inner edge, like glass splitting light. Put it in a
// `relative isolate` box with a `--glass-r` radius.
export const GLASS_PRISM = clsx(
  'pointer-events-none absolute inset-0.5 -z-15 rounded-[calc(var(--glass-r)-2px)] [mask:linear-gradient(to_bottom,transparent_55%,#000_90%)]',
  'before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent',
  'before:[background:var(--glass-prism)] before:[mask:linear-gradient(#fff_0_0)_padding-box_exclude,linear-gradient(#fff_0_0)]',
);

// The surface's outer edge and inner bevel, on a box with `relative isolate` and a `--glass-r` radius.
export const GLASS_EDGES = clsx(
  'before:absolute before:inset-px before:-z-15 before:rounded-[calc(var(--glass-r)-1px)] before:border before:border-transparent',
  'before:[background:var(--glass-inner-border)] before:[mask:linear-gradient(#fff_0_0)_padding-box_exclude,linear-gradient(#fff_0_0)]',
  'after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:border after:border-transparent',
  'after:[background:var(--glass-border)] after:[mask:linear-gradient(#fff_0_0)_padding-box_exclude,linear-gradient(#fff_0_0)]',
);
