// ─── Token Defaults ──────────────────────────────────────────────────────────

/** Baseline design token values. Every Mosaic theme starts from this object. */
export const defaultMosaicVariables = Object.freeze({
  color: {
    primary: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
    primaryForeground: 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  },
  spacing: '0.25rem',
  rounded: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: 'calc(infinity * 1px)',
  },
  text: {
    xs: { fontSize: '0.75rem', lineHeight: 'calc(1 / 0.75)' },
    sm: { fontSize: '0.875rem', lineHeight: 'calc(1.25 / 0.875)' },
    base: { fontSize: '1rem', lineHeight: 'calc(1.5 / 1)' },
    lg: { fontSize: '1.125rem', lineHeight: 'calc(1.75 / 1.125)' },
    xl: { fontSize: '1.25rem', lineHeight: 'calc(1.75 / 1.25)' },
    '2xl': { fontSize: '1.5rem', lineHeight: 'calc(2 / 1.5)' },
  },
} as const);

/** Structural type of the raw token tree, inferred from `defaultMosaicVariables`. */
export type MosaicTokens = typeof defaultMosaicVariables;

// ─── Public Types ─────────────────────────────────────────────────────────────

/** Partial token overrides accepted by `MosaicProvider`. Any subset of the token tree can be supplied. */
export type MosaicVariables = {
  [K in keyof MosaicTokens]?: MosaicTokens[K] extends string
    ? string
    : {
        [J in keyof MosaicTokens[K]]?: MosaicTokens[K][J] extends Record<string, string>
          ? { [P in keyof MosaicTokens[K][J]]?: string }
          : string;
      };
};

/**
 * Resolved theme object passed to `cva` config functions and `sx` props.
 * Raw `spacing` and `text` tokens are replaced with typed helper functions.
 *
 * @example
 * cva(theme => ({
 *   base: {
 *     padding: theme.spacing(2),       // 'calc(0.25rem * 2)'
 *     color: theme.alpha('primary', 50), // 'color-mix(in oklab, ..., transparent)'
 *     ...theme.text('sm'),             // { fontSize, lineHeight }
 *   },
 * }))
 */
export type MosaicTheme = Omit<MosaicTokens, 'spacing' | 'text'> & {
  /** Returns `calc(<base> * N)` for the given multiplier. */
  readonly spacing: <N extends number>(n: N) => `calc(${MosaicTokens['spacing']} * ${N})`;
  /** Mixes a theme color with `transparent` at the given opacity percentage. */
  readonly alpha: <K extends keyof MosaicTokens['color'], O extends number>(
    color: K,
    opacity: O,
  ) => `color-mix(in oklab, ${MosaicTokens['color'][K]} ${O}%, transparent)`;
  /** Blends two theme colors at the given percentage using `color-mix`. */
  readonly mix: <A extends keyof MosaicTokens['color'], B extends keyof MosaicTokens['color'], P extends number>(
    a: A,
    b: B,
    percentage: P,
  ) => `color-mix(in oklab, ${MosaicTokens['color'][A]}, ${MosaicTokens['color'][B]} ${P}%)`;
  /** Returns `{ fontSize, lineHeight }` for a named type-scale step. */
  readonly text: <K extends keyof MosaicTokens['text']>(
    key: K,
  ) => { fontSize: MosaicTokens['text'][K]['fontSize']; lineHeight: MosaicTokens['text'][K]['lineHeight'] };
};

// ─── Internal ─────────────────────────────────────────────────────────────────

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Immutable deep merge — returns a new object without mutating either argument. */
function merge(target: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const k in overrides) {
    if (DANGEROUS_KEYS.has(k)) continue;
    const value = overrides[k];
    if (value === undefined) continue;
    result[k] =
      typeof value === 'object' && value !== null && typeof result[k] === 'object'
        ? merge(result[k] as Record<string, unknown>, value as Record<string, unknown>)
        : value;
  }
  return result;
}

/** Merges token overrides into the defaults and attaches the `MosaicTheme` helper functions. */
export function resolveVariables(defaults: MosaicTokens, variables?: MosaicVariables): MosaicTheme {
  const tokens = variables ? (merge(defaults, variables) as MosaicTokens) : defaults;
  return {
    ...tokens,
    spacing: (<N extends number>(n: N) => `calc(${tokens.spacing} * ${n})`) as MosaicTheme['spacing'],
    alpha: (<K extends keyof MosaicTokens['color'], O extends number>(color: K, opacity: O) =>
      `color-mix(in oklab, ${tokens.color[color]} ${opacity}%, transparent)`) as MosaicTheme['alpha'],
    mix: (<A extends keyof MosaicTokens['color'], B extends keyof MosaicTokens['color'], P extends number>(
      a: A,
      b: B,
      percentage: P,
    ) => `color-mix(in oklab, ${tokens.color[a]}, ${tokens.color[b]} ${percentage}%)`) as MosaicTheme['mix'],
    text: (<K extends keyof MosaicTokens['text']>(key: K) => ({
      fontSize: tokens.text[key].fontSize,
      lineHeight: tokens.text[key].lineHeight,
    })) as MosaicTheme['text'],
  };
}
