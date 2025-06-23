import type { ColorScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';

const CONFIG = {
  TARGET_L_50_SHADE: 97,
  TARGET_L_900_SHADE: 12,
  LIGHT_SHADES_COUNT: 7,
  DARK_SHADES_COUNT: 7,
} as const;

export const COLOR_SCALE = [25, 50, 100, 150, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950] as const;
export type ColorShade = (typeof COLOR_SCALE)[number];

const getColorMix = (color: string, shade: ColorShade): string => {
  if (shade === 500) return color;

  if (cssSupports.relativeColorSyntax()) {
    return getRelativeColorSyntax(color, shade);
  }

  if (cssSupports.colorMix()) {
    return getColorMixSyntax(color, shade);
  }

  return color;
};

export const getRelativeColorSyntax = (color: string, shade: ColorShade): string => {
  const { TARGET_L_50_SHADE, TARGET_L_900_SHADE, LIGHT_SHADES_COUNT, DARK_SHADES_COUNT } = CONFIG;

  const lightShadeMap: Record<number, number> = {
    400: 1,
    300: 2,
    200: 3,
    150: 4,
    100: 5,
    50: 6,
    25: 7,
  };

  const darkShadeMap: Record<number, number> = {
    600: 1,
    700: 2,
    750: 3,
    800: 4,
    850: 5,
    900: 6,
    950: 7,
  };

  if (shade in lightShadeMap) {
    const steps = lightShadeMap[shade];
    return `hsl(from ${color} h s calc(l + (${steps} * ((${TARGET_L_50_SHADE} - l) / ${LIGHT_SHADES_COUNT}))))`;
  }

  if (shade in darkShadeMap) {
    const steps = darkShadeMap[shade];
    return `hsl(from ${color} h s calc(l - (${steps} * ((l - ${TARGET_L_900_SHADE}) / ${DARK_SHADES_COUNT}))))`;
  }

  return color;
};

const SHADE_MIX_DATA = {
  25: { mixColor: 'white', percentage: 85 },
  50: { mixColor: 'white', percentage: 80 },
  100: { mixColor: 'white', percentage: 68 },
  150: { mixColor: 'white', percentage: 55 },
  200: { mixColor: 'white', percentage: 40 },
  300: { mixColor: 'white', percentage: 26 },
  400: { mixColor: 'white', percentage: 16 },
  500: { mixColor: null, percentage: 0 },
  600: { mixColor: 'black', percentage: 12 },
  700: { mixColor: 'black', percentage: 22 },
  750: { mixColor: 'black', percentage: 30 },
  800: { mixColor: 'black', percentage: 44 },
  850: { mixColor: 'black', percentage: 55 },
  900: { mixColor: 'black', percentage: 65 },
  950: { mixColor: 'black', percentage: 75 },
} as const;

const ALPHA_PERCENTAGES = {
  25: 2,
  50: 3,
  100: 7,
  150: 11,
  200: 15,
  300: 28,
  400: 41,
  500: 53,
  600: 62,
  700: 73,
  750: 78,
  800: 81,
  850: 84,
  900: 87,
  950: 92,
} as const;

const createColorMix = (baseColor: string, mixColor: string, percentage: number): string => {
  return `color-mix(in srgb, ${baseColor}, ${mixColor} ${percentage}%)`;
};

export const getColorMixSyntax = (color: string, shade: ColorShade): string => {
  const mixData = SHADE_MIX_DATA[shade];

  if (mixData.mixColor === null) {
    return color;
  }

  return createColorMix(color, mixData.mixColor, mixData.percentage);
};

const getColorMixAlpha = (color: string, shade: ColorShade): string => {
  const alphaPercentage = ALPHA_PERCENTAGES[shade];

  if (alphaPercentage === undefined) {
    return color;
  }

  return createColorMix('transparent', color, alphaPercentage);
};

const applyScalePrefix = <Prefix extends string>(
  scale: ColorScale<string | undefined>,
  prefix: Prefix,
): Record<`${Prefix}${keyof ColorScale<string>}`, string> => {
  return Object.fromEntries(
    Object.entries(scale)
      .filter(([, color]) => color !== undefined)
      .map(([shade, color]) => [prefix + shade, color]),
  ) as Record<`${Prefix}${keyof ColorScale<string>}`, string>;
};

const colorMix = (colorOne: string, colorTwo: string): string => {
  return `color-mix(in srgb, ${colorOne}, ${colorTwo})`;
};

export { getColorMix, getColorMixAlpha, colorMix, applyScalePrefix };
