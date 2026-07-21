import * as stylex from '@stylexjs/stylex';

// Mosaic design tokens.
//
// `stylex.defineVars` normally hashes variable names (e.g. `--x1a2b3c`), which
// consumers cannot target. Keys that start with `--` are emitted verbatim, so
// these become real, stable custom properties a consumer can override in plain
// CSS without touching StyleX:
//
//   :root { --cl-color-accent: rebeccapurple; }
//
// StyleX still emits `:root { --cl-color-accent: … }` as the default. Following
// astryx's structure: each group is a plain `*Defaults` object wrapped by
// `defineVars`. The `*VarName` unions are derived from the exported `*Vars` in
// `styles/index.ts` — the `@stylexjs/enforce-extension` rule requires a
// `.stylex.ts` file to export nothing but its `defineVars` results. Color tokens
// carry light and dark in one `light-dark(...)` value, so dark mode lives in the token
// layer and resolves against the `color-scheme` in scope, with no
// `@media (prefers-color-scheme)` duplication. Names are semantic (`accent`,
// `on-accent`, `error`) rather than role-specific. The `--cl-` prefix namespaces
// the vars so they never collide with a host app's own custom properties.

// =============================================================================
// Color Tokens
// =============================================================================

const colorDefaults = {
  '--cl-color-accent': 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
  '--cl-color-on-accent': 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  '--cl-color-error': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.637 0.237 25.331))',
  '--cl-color-on-error': 'oklch(0.985 0 0)',
  '--cl-color-neutral': 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  '--cl-color-background-surface': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  '--cl-color-text-primary': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--cl-color-text-secondary': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--cl-color-border': 'light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))',
} as const;

export const colorVars = stylex.defineVars(colorDefaults);

// =============================================================================
// Size Tokens — interactive element heights
// =============================================================================

const sizeDefaults = {
  '--cl-size-element-sm': '1.75rem',
  '--cl-size-element-md': '2rem',
  '--cl-size-element-lg': '2.25rem',
} as const;

export const sizeVars = stylex.defineVars(sizeDefaults);

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
// Astryx's scale expressed in rems rather than pixels (1rem = 16px).

const spacingDefaults = {
  '--cl-spacing-0': '0rem',
  '--cl-spacing-0-5': '0.125rem',
  '--cl-spacing-1': '0.25rem',
  '--cl-spacing-1-5': '0.375rem',
  '--cl-spacing-2': '0.5rem',
  '--cl-spacing-3': '0.75rem',
  '--cl-spacing-4': '1rem',
  '--cl-spacing-5': '1.25rem',
  '--cl-spacing-6': '1.5rem',
  '--cl-spacing-7': '1.75rem',
  '--cl-spacing-8': '2rem',
  '--cl-spacing-9': '2.25rem',
  '--cl-spacing-10': '2.5rem',
  '--cl-spacing-11': '2.75rem',
  '--cl-spacing-12': '3rem',
} as const;

export const spacingVars = stylex.defineVars(spacingDefaults);

// =============================================================================
// Typography Tokens — type scale
// =============================================================================
// Size + weight + leading grouped per semantic slot, mirroring astryx's
// `typeScaleVars`. `defineVars` values are single CSS values, so each facet is
// its own var.

const typeScaleDefaults = {
  '--cl-text-label-size': '0.875rem',
  '--cl-text-label-weight': '500',
  '--cl-text-label-leading': 'calc(1.25 / 0.875)',
  '--cl-text-label-sm-size': '0.75rem',
  '--cl-text-label-sm-weight': '500',
  '--cl-text-label-sm-leading': 'calc(1 / 0.75)',
} as const;

export const typeScaleVars = stylex.defineVars(typeScaleDefaults);
