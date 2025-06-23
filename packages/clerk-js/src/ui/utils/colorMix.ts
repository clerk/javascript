/**
 * A percentage string
 * @example '10%'
 */
type Percentage = `${number}%`;

/**
 * A default key for a shade of a color/lightness/etc
 * @example '25'
 */
type DefaultShadeKey =
  | '25'
  | '50'
  | '100'
  | '150'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '750'
  | '800'
  | '850'
  | '900'
  | '950';

/**
 * A key for a shade of an alpha color
 * @example '25'
 */
type AlphaShadeKey = DefaultShadeKey;

/**
 * A key for a shade of a lightness color
 * @example '25'
 */
type LightnessShadeKey = DefaultShadeKey;

/**
 * Mix a color with a color tint
 * @param color - The color to mix
 * @param percentage - The percentage to mix the color with
 * @param colorTint - The color to mix the color with
 * @returns The mixed color
 */
export function colorMix(colorOne: string, colorTwo: string) {
  return `color-mix(in oklch, ${colorOne}, ${colorTwo})`;
}

/**
 * Transparentize a color by a percentage
 * @param color - The color to transparentize
 * @param percentage - The percentage to transparentize the color by
 * @returns The transparentized color
 */
export function transparentize(color: string, percentage: Percentage) {
  return colorMix(`${color} ${percentage}`, 'transparent');
}

/**
 * Lighten a color by a percentage
 * @param color - The color to lighten
 * @param percentage - The percentage to lighten the color by
 * @returns The lightened color
 */
export function lighten(color: string, percentage: Percentage) {
  return colorMix(`${color} ${percentage}`, 'white');
}

/**
 * Darken a color by a percentage
 * @param color - The color to darken
 * @param percentage - The percentage to darken the color by
 * @returns The darkened color
 */
export function darken(color: string, percentage: Percentage) {
  return colorMix(`${color} ${percentage}`, 'black');
}

/**
 * A map of alpha shades to percentages
 */
const ALPHA_SHADES_MAP: Record<AlphaShadeKey, Percentage> = {
  '25': '2%',
  '50': '3%',
  '100': '7%',
  '150': '11%',
  '200': '15%',
  '300': '28%',
  '400': '41%',
  '500': '53%',
  '600': '62%',
  '700': '73%',
  '750': '78%',
  '800': '81%',
  '850': '84%',
  '900': '87%',
  '950': '92%',
} as const;

/**
 * Create an alpha scale with transparentize
 * @param baseColor - The base color
 * @param prefix - The prefix for the scale
 * @returns The alpha scale
 */
export function createAlphaScaleWithTransparentize<P extends string>(
  baseColor: string,
  prefix: P,
): Record<`${P}${AlphaShadeKey}`, string> {
  return Object.fromEntries(
    Object.entries(ALPHA_SHADES_MAP).map(([shadeKey, percentage]) => [
      `${prefix}${shadeKey}`,
      transparentize(baseColor, percentage),
    ]),
  ) as Record<`${P}${AlphaShadeKey}`, string>;
}

const LIGHTNESS_SHADES_DEF: Record<LightnessShadeKey, { type: 'lighten' | 'darken' | 'base'; amount: Percentage }> = {
  '25': { type: 'lighten', amount: '92%' },
  '50': { type: 'lighten', amount: '85%' },
  '100': { type: 'lighten', amount: '70%' },
  '150': { type: 'lighten', amount: '55%' },
  '200': { type: 'lighten', amount: '40%' },
  '300': { type: 'lighten', amount: '25%' },
  '400': { type: 'lighten', amount: '10%' },
  '500': { type: 'base', amount: '0%' },
  '600': { type: 'darken', amount: '10%' },
  '700': { type: 'darken', amount: '25%' },
  '750': { type: 'darken', amount: '40%' },
  '800': { type: 'darken', amount: '55%' },
  '850': { type: 'darken', amount: '70%' },
  '900': { type: 'darken', amount: '85%' },
  '950': { type: 'darken', amount: '92%' },
};

const ALL_LIGHTNESS_SHADE_KEYS = Object.keys(LIGHTNESS_SHADES_DEF) as LightnessShadeKey[];

/**
 * Creates a full lightness color scale (shades 25-950) using color-mix lighten/darken.
 * @param colorOption The base color string (used as 500 shade) or a partial scale object.
 * @param prefix The prefix for the scale keys (e.g., 'primary').
 * @returns A prefixed color scale object, or undefined if colorOption is undefined.
 */
export function createColorMixLightnessScale<P extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>>,
  prefix: P,
): Record<`${P}${LightnessShadeKey}`, string>;
export function createColorMixLightnessScale<P extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>> | undefined,
  prefix: P,
): Record<`${P}${LightnessShadeKey}`, string> | undefined;
export function createColorMixLightnessScale<P extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>> | undefined,
  prefix: P,
): Record<`${P}${LightnessShadeKey}`, string> | undefined {
  if (!colorOption) {
    return undefined;
  }

  let baseFor500: string;
  const userProvidedShades: Partial<Record<LightnessShadeKey, string>> = {};

  if (typeof colorOption === 'string') {
    baseFor500 = colorOption;
  } else {
    if (!colorOption['500']) {
      throw new Error(
        `Color scale generation for prefix '${prefix}' failed: The '500' shade is required in the colorOption object.`,
      );
    }
    baseFor500 = colorOption['500'];
    for (const key of ALL_LIGHTNESS_SHADE_KEYS) {
      if (colorOption[key]) {
        userProvidedShades[key] = colorOption[key];
      }
    }
  }

  const generatedScale: Partial<Record<LightnessShadeKey, string>> = {};
  for (const shadeKey of ALL_LIGHTNESS_SHADE_KEYS) {
    const definition = LIGHTNESS_SHADES_DEF[shadeKey];
    switch (definition.type) {
      case 'base':
        generatedScale[shadeKey] = baseFor500;
        break;
      case 'lighten':
        generatedScale[shadeKey] = lighten(baseFor500, definition.amount);
        break;
      case 'darken':
        generatedScale[shadeKey] = darken(baseFor500, definition.amount);
        break;
    }
  }

  const mergedScale = { ...generatedScale, ...userProvidedShades };

  const resultScale = {} as Record<`${P}${LightnessShadeKey}`, string>;
  for (const key of ALL_LIGHTNESS_SHADE_KEYS) {
    if (mergedScale[key]) {
      resultScale[`${prefix}${key}`] = mergedScale[key];
    }
  }
  return resultScale;
}
