export const defaultMosaicVariables = Object.freeze({
  color: {
    primary: 'light-dark(oklch(0.205 0 0), oklch(0.922 0 0))',
    primaryForeground: 'light-dark(oklch(0.985 0 0), oklch(0.205 0 0))',
  },
  spacing: '0.25rem',
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: 'calc(infinity * 1px)',
  },
  fontSize: {
    xs: { size: '0.75rem', lineHeight: 'calc(1 / 0.75)' },
    sm: { size: '0.875rem', lineHeight: 'calc(1.25 / 0.875)' },
    base: { size: '1rem', lineHeight: 'calc(1.5 / 1)' },
    lg: { size: '1.125rem', lineHeight: 'calc(1.75 / 1.125)' },
    xl: { size: '1.25rem', lineHeight: 'calc(1.75 / 1.25)' },
    '2xl': { size: '1.5rem', lineHeight: 'calc(2 / 1.5)' },
  },
} as const);

export type MosaicTokens = typeof defaultMosaicVariables;

export type MosaicVariables = {
  [K in keyof MosaicTokens]?: MosaicTokens[K] extends string
    ? string
    : {
        [J in keyof MosaicTokens[K]]?: MosaicTokens[K][J] extends Record<string, string>
          ? { [P in keyof MosaicTokens[K][J]]?: string }
          : string;
      };
};

export type MosaicTheme = Omit<MosaicTokens, 'spacing' | 'fontSize'> & {
  readonly spacing: <N extends number>(n: N) => `calc(${MosaicTokens['spacing']} * ${N})`;
  readonly alpha: <K extends keyof MosaicTokens['color'], O extends number>(
    color: K,
    opacity: O,
  ) => `color-mix(in oklab, ${MosaicTokens['color'][K]} ${O}%, transparent)`;
  readonly mix: <A extends keyof MosaicTokens['color'], B extends keyof MosaicTokens['color'], P extends number>(
    a: A,
    b: B,
    percentage: P,
  ) => `color-mix(in oklab, ${MosaicTokens['color'][A]}, ${MosaicTokens['color'][B]} ${P}%)`;
  readonly text: <K extends keyof MosaicTokens['fontSize']>(
    key: K,
  ) => { fontSize: MosaicTokens['fontSize'][K]['size']; lineHeight: MosaicTokens['fontSize'][K]['lineHeight'] };
};

function merge(target: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const k in overrides) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') break;
    const value = overrides[k];
    if (value === undefined) continue;
    result[k] =
      typeof value === 'object' && value !== null && typeof result[k] === 'object'
        ? merge(result[k] as Record<string, unknown>, value as Record<string, unknown>)
        : value;
  }
  return result;
}

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
    text: (<K extends keyof MosaicTokens['fontSize']>(key: K) => ({
      fontSize: tokens.fontSize[key].size,
      lineHeight: tokens.fontSize[key].lineHeight,
    })) as MosaicTheme['text'],
  };
}
