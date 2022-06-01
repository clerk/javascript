import { ColorOption, ColorScale, HslaColor } from '@clerk/types';
import { HslaColorString } from '@clerk/types/src';

import { hslaColorToHslaString, stringToHslaColor } from '../utils';

const LIGHT_SHADES = ['50', '100', '200', '300', '400'].reverse();
const DARK_SHADES = ['600', '700', '800', '900'];

const TARGET_L_50_SHADE = 0.97;
const TARGET_L_900_SHADE = 0.12;

function createEmptyColorScale<T = undefined>(): ColorScale<T | undefined> {
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

export const transformColorToColorScale = <Prefix extends string>(
  colorOption: ColorOption | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'object' && !colorOption['500']) {
    throw new Error('You need to provide at least the 500 shade');
  }

  const userDefinedHslaColorScale = userDefinedColorToHslaColorScale(colorOption);
  const filledHslaColorScale = generateFilledScaleFromBaseHslaColor(userDefinedHslaColorScale['500']);
  const merged = mergeFilledIntoUserDefinedScale(filledHslaColorScale, userDefinedHslaColorScale);
  return prefixAndStringifyHslaScale(merged, prefix);
};

const mergeFilledIntoUserDefinedScale = (
  generated: ColorScale<HslaColor>,
  userDefined: ColorScale<HslaColor>,
): ColorScale<HslaColor> => {
  // @ts-expect-error
  return Object.fromEntries(Object.entries(userDefined).map(([k, v]) => [k, v || generated[k]]));
};

const prefixAndStringifyHslaScale = (scale: ColorScale<HslaColor>, prefix: string): ColorScale<HslaColor> => {
  const entries = Object.entries(scale).map(([k, v]) => [prefix + k, hslaColorToHslaString(v)]);
  return Object.fromEntries(entries) as ColorScale<HslaColor>;
};

const userDefinedColorToHslaColorScale = (colorOption: ColorOption): ColorScale<HslaColor> => {
  const baseScale = typeof colorOption === 'string' ? { '500': colorOption } : colorOption;
  const hslaScale = createEmptyColorScale();
  type Key = keyof typeof baseScale;
  const entries = Object.keys(hslaScale).map(k => [k, stringToHslaColor(baseScale[k as any as Key])]);
  return Object.fromEntries(entries) as ColorScale<HslaColor>;
};

/**
 * This function generates a color scale using `base` as the 500 shade.
 * The lightest shade (50) will always have a lightness of TARGET_L_50_SHADE,
 * and the darkest shade (900) will always have a lightness of TARGET_L_900_SHADE.
 * It calculates the required inc/decr lightness steps and applies them to base
 */
const generateFilledScaleFromBaseHslaColor = (base: HslaColor): ColorScale<HslaColor> => {
  const newScale = createEmptyColorScale<HslaColor>();
  type Key = keyof typeof newScale;
  newScale['500'] = base;

  const lightPerc = (TARGET_L_50_SHADE - base.l) / LIGHT_SHADES.length;
  const darkPerc = (base.l - TARGET_L_900_SHADE) / DARK_SHADES.length;

  LIGHT_SHADES.forEach((shade, i) => (newScale[shade as any as Key] = changeHslaLightness(base, (i + 1) * lightPerc)));
  DARK_SHADES.map((shade, i) => (newScale[shade as any as Key] = changeHslaLightness(base, (i + 1) * darkPerc * -1)));
  return newScale as ColorScale<HslaColor>;
};

const changeHslaLightness = (color: HslaColor, num: number): HslaColor => {
  return { ...color, l: color.l + num };
};
