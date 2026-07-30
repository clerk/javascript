import * as stylex from '@stylexjs/stylex';

// Mosaic design tokens.
//
// `stylex.defineVars` normally hashes variable names (e.g. `--x1a2b3c`), which
// consumers cannot target. Keys that start with `--` are emitted verbatim, so
// these become real, stable custom properties a consumer can override in plain
// CSS without touching StyleX:
//
//   :root { --cl-color-primary: rebeccapurple; }
//
// StyleX still emits `:root { --cl-color-primary: … }` as the default. Following
// astryx's structure: each group is a plain `*Defaults` object wrapped by
// `defineVars`. The `*VarName` unions are derived from the exported `*Vars` in
// `styles/index.ts` — the `@stylexjs/enforce-extension` rule requires a
// `.stylex.ts` file to export nothing but its `defineVars` results. Color tokens
// carry light and dark in one `light-dark(...)` value, so dark mode lives in the token
// layer and resolves against the `color-scheme` in scope, with no
// `@media (prefers-color-scheme)` duplication. The `--cl-` prefix namespaces
// the vars so they never collide with a host app's own custom properties.

// =============================================================================
// Color Tokens
// =============================================================================

const colorDefaults = {
  '--cl-color-primary': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--cl-color-primary-foreground': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  '--cl-color-primary-faded': 'light-dark(oklch(0.9583 0.0214 291.74), oklch(0.3097 0.1008 285.05))',

  '--cl-color-neutral': 'light-dark(oklch(0.2928 0.0163 285.35), oklch(0.9854 0.0013 286.38))',
  '--cl-color-neutral-foreground': 'light-dark(oklch(0.24 0 0), oklch(0.96 0 0))',
  '--cl-color-neutral-faded': 'light-dark(oklch(0.5697 0.0246 279.94), oklch(0.6953 0.0261 285.7))',

  '--cl-color-negative': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.637 0.237 25.331))',
  '--cl-color-negative-foreground': 'oklch(0.985 0 0)',
  '--cl-color-negative-faded': 'light-dark(oklch(0.9757 0.0118 17.36), oklch(0.255 0.0604 22.31))',

  '--cl-color-positive': 'light-dark(oklch(0.548 0.153 152.535), oklch(0.696 0.17 162.48))',
  '--cl-color-positive-foreground': 'oklch(0.985 0 0)',
  '--cl-color-positive-faded': 'light-dark(oklch(0.9859 0.0164 156.92), oklch(0.3297 0.052 152.31))',

  '--cl-color-warning': 'light-dark(oklch(0.646 0.222 41.116), oklch(0.75 0.183 55.934))',
  '--cl-color-warning-foreground': 'oklch(0.985 0 0)',
  '--cl-color-warning-faded': 'light-dark(oklch(0.9799 0.0147 70.89), oklch(0.2725 0.0547 55.7))',

  '--cl-color-card': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  '--cl-color-card-foreground': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',

  '--cl-color-border': 'light-dark(oklch(0.9475 0.0067 286.27), oklch(0.3321 0.014 285.61))',
  '--cl-color-border-faded': 'light-dark(oklch(0.9587 0.0027 286.35), oklch(0.296 0.0126 285.61))',
} as const;

export const colorVars = stylex.defineVars(colorDefaults);

// =============================================================================
// Radius Tokens
// =============================================================================

const radiusDefaults = {
  '--cl-radius-none': '0rem',
  '--cl-radius-inner': '0.25rem',
  '--cl-radius-element': '0.5rem',
  '--cl-radius-container': '0.75rem',
  '--cl-radius-full': 'calc(infinity * 1px)',
} as const;

export const radiusVars = stylex.defineVars(radiusDefaults);

// =============================================================================
// Spacing Tokens
// =============================================================================
// `--cl-spacing` is the ONLY exposed custom property (the base unit, Tailwind's
// model). Overriding it rescales every gap, pad, and control height at once.

const spacingDefaults = {
  '--cl-spacing': '0.25rem',
} as const;

export const spacingVars = stylex.defineVars(spacingDefaults);

// The scale is `defineVars` (like astryx's `spacingVars`): each step is a StyleX
// var whose default is `calc(var(--cl-spacing) * n)`, so overriding `--cl-spacing`
// still rescales the whole scale. `defineConsts` was tried here but emits no CSS
// across module boundaries — consumers got dangling `var(--hash)` refs. StyleX
// hashes these var names (they aren't `--cl-*`), so only `--cl-spacing` stays a
// stable, targetable custom property. `space['2']` reads like Tailwind's `space-2`.
const step = (multiple: number): string => `calc(var(--cl-spacing) * ${multiple})`;

export const space = stylex.defineVars({
  '0': '0px',
  '0.5': step(0.5),
  '1': step(1),
  '1.5': step(1.5),
  '2': step(2),
  '2.5': step(2.5),
  '3': step(3),
  '3.5': step(3.5),
  '4': step(4),
  '5': step(5),
  '6': step(6),
  '7': step(7),
  '8': step(8),
  '9': step(9),
  '10': step(10),
  '11': step(11),
  '12': step(12),
});

// =============================================================================
// Typography Tokens — type scale
// =============================================================================
// One named step scale every text-bearing component sizes against. `defineVars`
// values are single CSS values, so size and leading are each their own var.

const typeScaleDefaults = {
  '--cl-text-xs-size': '0.75rem',
  '--cl-text-xs-leading': 'calc(1 / 0.75)',
  '--cl-text-sm-size': '0.875rem',
  '--cl-text-sm-leading': 'calc(1.25 / 0.875)',
  '--cl-text-base-size': '1rem',
  '--cl-text-base-leading': 'calc(1.5 / 1)',
  '--cl-text-lg-size': '1.125rem',
  '--cl-text-lg-leading': 'calc(1.75 / 1.125)',
  '--cl-text-xl-size': '1.25rem',
  '--cl-text-xl-leading': 'calc(1.75 / 1.25)',
  '--cl-text-2xl-size': '1.5rem',
  '--cl-text-2xl-leading': 'calc(2 / 1.5)',
} as const;

export const typeScaleVars = stylex.defineVars(typeScaleDefaults);

// =============================================================================
// Typography Tokens — font weight
// =============================================================================
// Kept separate from the step scale: weight and size vary independently.

const fontWeightDefaults = {
  '--cl-font-normal': '400',
  '--cl-font-medium': '500',
  '--cl-font-semibold': '600',
  '--cl-font-bold': '700',
} as const;

export const fontWeightVars = stylex.defineVars(fontWeightDefaults);
