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
  '--cl-color-destructive': 'light-dark(oklch(0.577 0.245 27.325), oklch(0.637 0.237 25.331))',
  '--cl-color-destructive-foreground': 'oklch(0.985 0 0)',
  '--cl-color-muted': 'light-dark(oklch(0.97 0 0), oklch(0.269 0 0))',
  '--cl-color-muted-foreground': 'light-dark(oklch(0.556 0 0), oklch(0.708 0 0))',
  '--cl-color-card': 'light-dark(oklch(1 0 0), oklch(0.205 0 0))',
  '--cl-color-card-foreground': 'light-dark(oklch(0.145 0 0), oklch(0.985 0 0))',
  '--cl-color-border': 'light-dark(oklch(0.922 0 0), oklch(1 0 0 / 10%))',
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

// The scale is `defineConsts`, not `defineVars`: each step is inlined at build
// time as `calc(var(--cl-spacing) * n)`, so it carries no custom property of its
// own. `space['2']` reads like Tailwind's `space-2` and stays a shared token
// (StyleX inlines it cross-module; a plain helper function cannot be).
const step = (multiple: number): string => `calc(var(--cl-spacing) * ${multiple})`;

export const space = stylex.defineConsts({
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
