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
  const variables = theme.variables || {};

  //values dependent on other values
  const textSecondary = toHSLA(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.15);
  const textTertiary = toHSLA(variables.colorTextTertiary) || colors.makeTransparent(textSecondary, 0.4);

  const primaryScale = colorOptionToHslaLightnessScale(variables.colorPrimary, 'primary');

  return removeUndefinedProps({
    ...primaryScale,
    ...colorOptionToHslaAlphaScale(variables.colorPrimary, 'primaryAlpha'),
    ...colorOptionToHslaLightnessScale(variables.colorSecondary, 'secondary'),
    ...colorOptionToHslaLightnessScale(variables.colorDanger, 'danger'),
    ...colorOptionToHslaAlphaScale(variables.colorDanger, 'dangerAlpha'),
    ...colorOptionToHslaLightnessScale(variables.colorSuccess, 'success'),
    ...colorOptionToHslaAlphaScale(variables.colorSuccess, 'successAlpha'),
    ...colorOptionToHslaLightnessScale(variables.colorWarning, 'warning'),
    ...colorOptionToHslaAlphaScale(variables.colorWarning, 'warningAlpha'),
    ...colorOptionToHslaAlphaScale(variables.colorAlphaShade, 'blackAlpha'),
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorTextOnSecondaryBackground: toHSLA(variables.colorTextOnSecondaryBackground),
    colorText: toHSLA(variables.colorText),
    colorTextSecondary: textSecondary,
    colorTextTertiary: textTertiary,
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
    colorShimmer: toHSLA(variables.colorShimmer),
    primaryHover: colors.adjustForLightness(primaryScale?.primary500),
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
  const { shadowShimmer } = theme.variables || {};
  return removeUndefinedProps({ shadowShimmer });
};

const splitCssUnit = (str: string) => {
  const numericValue = Number.parseFloat(str);
  const unit = str.replace(numericValue.toString(), '') || undefined;
  return { numericValue, unit };
};

const percentage = (base: number, perc: number) => {
  return base + base * perc;
};
