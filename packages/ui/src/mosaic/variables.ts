export const defaultMosaicVariables = Object.freeze({
  color: {
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
  },
  spacing: '0.25rem',
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: 'calc(infinity * 1px)',
  },
} as const);

export type MosaicTokens = typeof defaultMosaicVariables;

export type MosaicVariables = {
  [K in keyof MosaicTokens]?: MosaicTokens[K] extends string ? string : { [J in keyof MosaicTokens[K]]?: string };
};

export type MosaicTheme = Omit<MosaicTokens, 'spacing'> & {
  readonly spacing: <N extends number>(n: N) => `calc(${MosaicTokens['spacing']} * ${N})`;
  readonly alpha: <C extends string, O extends number>(
    color: C,
    opacity: O,
  ) => `color-mix(in oklab, ${C} ${O}%, transparent)`;
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
    alpha: (<C extends string, O extends number>(color: C, opacity: O) =>
      `color-mix(in oklab, ${color} ${opacity}%, transparent)`) as MosaicTheme['alpha'],
  };
}
