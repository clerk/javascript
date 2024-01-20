import type { Theme } from '@clerk/types';

import { spaceScaleKeys } from '../foundations/sizes';
import type { fontSizes, fontWeights } from '../foundations/typography';
import {
  colorOptionToHslaAlphaScale,
  colorOptionToHslaLightnessScale,
  colors,
  fromEntries,
  removeUndefinedProps,
} from '../utils';

export const createColorScales = (theme: Theme) => {
  const variables = theme.variables;

  //values dependent on other values
  const textSecondary =
    toHSLA(variables?.colors?.textSecondary) || colors.makeTransparent(variables?.colors?.text, 0.15);
  const textTertiary = toHSLA(variables?.colors?.textTertiary) || colors.makeTransparent(textSecondary, 0.4);

  return removeUndefinedProps({
    ...colorOptionToHslaLightnessScale(variables?.colors?.primary, 'primary'),
    ...colorOptionToHslaAlphaScale(variables?.colors?.primary, 'primaryAlpha'),
    ...colorOptionToHslaLightnessScale(variables?.colors?.secondary, 'secondary'),
    ...colorOptionToHslaLightnessScale(variables?.colors?.danger, 'danger'),
    ...colorOptionToHslaAlphaScale(variables?.colors?.danger, 'dangerAlpha'),
    ...colorOptionToHslaLightnessScale(variables?.colors?.success, 'success'),
    ...colorOptionToHslaAlphaScale(variables?.colors?.success, 'successAlpha'),
    ...colorOptionToHslaLightnessScale(variables?.colors?.warning, 'warning'),
    ...colorOptionToHslaAlphaScale(variables?.colors?.warning, 'warningAlpha'),
    ...colorOptionToHslaAlphaScale(variables?.colors?.alphaShade, 'blackAlpha'),
    primaryForeground: toHSLA(variables?.colors?.primaryForeground),
    secondaryForeground: toHSLA(variables?.colors?.secondaryForeground),
    text: toHSLA(variables?.colors?.text),
    textSecondary: textSecondary,
    textTertiary: textTertiary,
    inputForeground: toHSLA(variables?.colors?.inputForeground),
    background: toHSLA(variables?.colors?.background),
    input: toHSLA(variables?.colors?.input),
    shimmer: toHSLA(variables?.colors?.shimmer),
  });
};

export const createThemeOptions = (theme: Theme) => {
  const { fontSmoothing } = theme.variables || {};
  return removeUndefinedProps({ fontSmoothing });
};

export const toHSLA = (str: string | undefined) => {
  return str ? colors.toHslaString(str) : undefined;
};

export const createRadiiUnits = (theme: Theme) => {
  const { borderRadius } = theme.variables || {};
  if (borderRadius === undefined) {
    return;
  }

  const md = borderRadius === 'none' ? '0' : borderRadius;
  const { numericValue, unit = 'rem' } = splitCssUnit(md);
  return {
    sm: percentage(numericValue, 0.23).toString() + unit,
    md,
    lg: percentage(numericValue, 0.35).toString() + unit,
    xl: percentage(numericValue, 1.7).toString() + unit,
    '2xl': percentage(numericValue, 2.35).toString() + unit,
  };
};

export const createSpaceScale = (theme: Theme) => {
  const { spacingUnit } = theme.variables || {};
  if (spacingUnit === undefined) {
    return;
  }
  const { numericValue, unit } = splitCssUnit(spacingUnit);
  return fromEntries(
    spaceScaleKeys.map(k => {
      const num = Number.parseFloat(k.replace('x', '.'));
      const percentage = (num / 0.5) * 0.125;
      return [k, `${numericValue * percentage}${unit}`];
    }),
  );
};

// We want to keep the same ratio between the font sizes we have for the default theme
// This is directly related to the fontSizes object in the theme default foundations
// ref: src/ui/foundations/typography.ts
export const createFontSizeScale = (theme: Theme): Record<keyof typeof fontSizes, string> | undefined => {
  const { fontSize } = theme.variables || {};
  if (fontSize === undefined) {
    return;
  }
  const { numericValue, unit = 'rem' } = splitCssUnit(fontSize);
  return {
    xs: (numericValue * 0.8).toString() + unit,
    sm: (numericValue * 0.9).toString() + unit,
    md: fontSize,
    lg: (numericValue * 1.3).toString() + unit,
    xl: (numericValue * 1.85).toString() + unit,
  };
};

export const createFontWeightScale = (theme: Theme): Record<keyof typeof fontWeights, any> => {
  const { fontWeight } = theme.variables || {};
  return removeUndefinedProps({ ...fontWeight });
};

export const createFonts = (theme: Theme) => {
  const { fontFamily, fontFamilyButtons } = theme.variables || {};
  return removeUndefinedProps({ main: fontFamily, buttons: fontFamilyButtons });
};

export const createShadows = (theme: Theme) => {
  const { shimmerShadow } = theme.variables?.colors || {};
  return removeUndefinedProps({ shimmerShadow });
};

const splitCssUnit = (str: string) => {
  const numericValue = Number.parseFloat(str);
  const unit = str.replace(numericValue.toString(), '') || undefined;
  return { numericValue, unit };
};

const percentage = (base: number, perc: number) => {
  return base + base * perc;
};
