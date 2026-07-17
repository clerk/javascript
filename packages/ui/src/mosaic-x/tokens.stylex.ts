import * as stylex from '@stylexjs/stylex';

// Mosaic-X design tokens.
//
// defineVars normally hashes variable names (e.g. `--x1a2b3c`), which consumers
// cannot target. Keys that start with `--` are emitted verbatim, so these become
// real, stable custom properties (`--cl-foreground`, …). A consumer can override
// any of them in plain CSS without touching StyleX:
//
//   :root { --cl-foreground: red; }
//
// StyleX still emits `:root { --cl-foreground: black; }` as the default.
export const colors = stylex.defineVars({
  '--cl-foreground': 'black',
  '--cl-background': 'white',
  '--cl-primary': 'oklch(0.205 0 0)',
  '--cl-primary-foreground': 'oklch(0.985 0 0)',
  '--cl-destructive': 'oklch(0.577 0.245 27.325)',
  '--cl-destructive-foreground': 'oklch(0.985 0 0)',
  '--cl-border': 'oklch(0.922 0 0)',
  '--cl-muted-foreground': 'oklch(0.556 0 0)',
});

export const radius = stylex.defineVars({
  '--cl-radius-md': '0.375rem',
  '--cl-radius-full': 'calc(infinity * 1px)',
});

export const space = stylex.defineVars({
  '--cl-spacing': '0.25rem',
});
