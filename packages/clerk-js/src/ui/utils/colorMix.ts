import { cssSupports } from './cssSupports';

const CONFIG = {
  TARGET_L_50_SHADE: 97,
  TARGET_L_900_SHADE: 12,
  LIGHT_SHADES_COUNT: 7,
  DARK_SHADES_COUNT: 7,
} as const;

type ColorShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

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

const getRelativeColorSyntax = (color: string, shade: ColorShade): string => {
  const { TARGET_L_50_SHADE, TARGET_L_900_SHADE, LIGHT_SHADES_COUNT, DARK_SHADES_COUNT } = CONFIG;

  const lightShadeMap: Record<number, number> = { 400: 1, 300: 2, 200: 3, 100: 5 };
  const darkShadeMap: Record<number, number> = { 600: 1, 700: 2, 800: 4, 900: 6 };

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
  100: { mixColor: 'white', percentage: 68 },
  200: { mixColor: 'white', percentage: 40 },
  300: { mixColor: 'white', percentage: 26 },
  400: { mixColor: 'white', percentage: 16 },
  500: { mixColor: null, percentage: 0 },
  600: { mixColor: 'black', percentage: 12 },
  700: { mixColor: 'black', percentage: 22 },
  800: { mixColor: 'black', percentage: 44 },
  900: { mixColor: 'black', percentage: 65 },
} as const;

const ALPHA_PERCENTAGES = {
  100: 7,
  200: 15,
  300: 28,
  400: 41,
  500: 53,
  600: 62,
  700: 73,
  800: 81,
  900: 87,
} as const;

const createColorMix = (baseColor: string, mixColor: string, percentage: number): string => {
  return `color-mix(in srgb, ${baseColor}, ${mixColor} ${percentage}%)`;
};

const getColorMixSyntax = (color: string, shade: ColorShade): string => {
  const mixData = SHADE_MIX_DATA[shade];

  if (mixData.mixColor === null) {
    return color; // Base color (500)
  }

  return createColorMix(color, mixData.mixColor, mixData.percentage);
};

const getColorMixAlpha = (color: string, shade: number): string => {
  const alphaPercentage = ALPHA_PERCENTAGES[shade as keyof typeof ALPHA_PERCENTAGES];

  if (alphaPercentage === undefined) {
    return color;
  }

  return createColorMix('transparent', color, alphaPercentage);
};

export { getColorMix, getColorMixAlpha };
