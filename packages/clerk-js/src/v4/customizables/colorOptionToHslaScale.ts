import { ColorScale, CssColorOrScale, HslaColor, HslaColorString } from '@clerk/types';

import { colors } from '../utils';

type InternalColorScale<T> = ColorScale<T> & Partial<Record<20, T>>;

const LIGHT_SHADES = ['50', '100', '200', '300', '400'].reverse();
const DARK_SHADES = ['600', '700', '800', '900'];

const TARGET_L_50_SHADE = 97;
const TARGET_L_900_SHADE = 12;

function createEmptyColorScale<T = undefined>(): InternalColorScale<T | undefined> {
  return {
    '50': undefined,
    '100': undefined,
    '200': undefined,
    '300': undefined,
    '400': undefined,
    '500': undefined,
    '600': undefined,
    '700': undefined,
    '800': undefined,
    '900': undefined,
  };
}

type WithPrefix<T extends Record<string, string>, Prefix extends string> = {
  [k in keyof T as `${Prefix}${k & string}`]: T[k];
};

export const colorOptionToHslaAlphaScale = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  return fillUserProvidedScaleWithGeneratedHslaColors(colorOption, prefix, generateFilledAlphaScaleFromBaseHslaColor);
};

export const colorOptionToHslaLightnessScale = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  return fillUserProvidedScaleWithGeneratedHslaColors(colorOption, prefix, generateFilledScaleFromBaseHslaColor);
};

const fillUserProvidedScaleWithGeneratedHslaColors = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
  generator: (base: HslaColor) => InternalColorScale<HslaColor>,
): WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'object' && !colorOption['500']) {
    throw new Error('You need to provide at least the 500 shade');
  }

  const userDefinedHslaColorScale = userDefinedColorToHslaColorScale(colorOption);
  const filledHslaColorScale = generator(userDefinedHslaColorScale['500']);
  const merged = mergeFilledIntoUserDefinedScale(filledHslaColorScale, userDefinedHslaColorScale);
  return prefixAndStringifyHslaScale(merged, prefix);
};

const mergeFilledIntoUserDefinedScale = (
  generated: InternalColorScale<HslaColor>,
  userDefined: InternalColorScale<HslaColor>,
): InternalColorScale<HslaColor> => {
  // @ts-expect-error
  return Object.fromEntries(Object.entries(userDefined).map(([k, v]) => [k, v || generated[k]]));
};

const prefixAndStringifyHslaScale = (
  scale: InternalColorScale<HslaColor | undefined>,
  prefix: string,
): InternalColorScale<HslaColor> => {
  const res = {} as InternalColorScale<HslaColor>;
  for (const key in scale) {
    // @ts-expect-error
    if (scale[key]) {
      // @ts-expect-error
      res[prefix + key] = colors.toHslaString(scale[key]);
    }
  }
  return res;
};

const userDefinedColorToHslaColorScale = (colorOption: CssColorOrScale): InternalColorScale<HslaColor> => {
  const baseScale = typeof colorOption === 'string' ? { '500': colorOption } : colorOption;
  const hslaScale = createEmptyColorScale();
  // @ts-expect-error
  const entries = Object.keys(hslaScale).map(k => [k, baseScale[k] ? colors.toHslaColor(baseScale[k]) : undefined]);
  return Object.fromEntries(entries) as InternalColorScale<HslaColor>;
};

/**
 * This function generates a color scale using `base` as the 500 shade.
 * The lightest shade (50) will always have a lightness of TARGET_L_50_SHADE,
 * and the darkest shade (900) will always have a lightness of TARGET_L_900_SHADE.
 * It calculates the required inc/decr lightness steps and applies them to base
 */
const generateFilledScaleFromBaseHslaColor = (base: HslaColor): InternalColorScale<HslaColor> => {
  const newScale = createEmptyColorScale<HslaColor>();
  type Key = keyof typeof newScale;
  newScale['500'] = base;

  const lightPercentage = (TARGET_L_50_SHADE - base.l) / LIGHT_SHADES.length;
  const darkPercentage = (base.l - TARGET_L_900_SHADE) / DARK_SHADES.length;

  LIGHT_SHADES.forEach(
    (shade, i) => (newScale[shade as any as Key] = colors.changeHslaLightness(base, (i + 1) * lightPercentage)),
  );
  DARK_SHADES.map(
    (shade, i) => (newScale[shade as any as Key] = colors.changeHslaLightness(base, (i + 1) * darkPercentage * -1)),
  );
  return newScale as InternalColorScale<HslaColor>;
};

const generateFilledAlphaScaleFromBaseHslaColor = (base: HslaColor): InternalColorScale<HslaColor> => {
  const newScale = { 20: undefined, ...createEmptyColorScale<HslaColor>() };
  const baseWithoutAlpha = colors.setHslaAlpha(base, 0);
  const alphas = [0.02, 0.04, 0.06, 0.08, 0.16, 0.24, 0.36, 0.48, 0.64, 0.8, 0.92];
  // @ts-expect-error
  Object.keys(newScale).forEach((k, i) => (newScale[k] = colors.setHslaAlpha(baseWithoutAlpha, alphas[i])));
  return newScale as InternalColorScale<HslaColor>;
};
