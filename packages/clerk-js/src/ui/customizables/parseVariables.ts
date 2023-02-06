import type { Theme } from '@clerk/types';

import { spaceScaleKeys } from '../foundations/sizes';
import type { fontSizes, fontWeights } from '../foundations/typography';
import { colors, fromEntries, removeUndefinedProps } from '../utils';
import { colorOptionToHslaAlphaScale, colorOptionToHslaLightnessScale } from './colorOptionToHslaScale';

export const createColorScales = (theme: Theme) => {
  const variables = theme.variables || {};
  return removeUndefinedProps({
    ...colorOptionToHslaLightnessScale(variables.colorPrimary, 'primary'),
    ...colorOptionToHslaLightnessScale(variables.colorDanger, 'danger'),
    ...colorOptionToHslaLightnessScale(variables.colorSuccess, 'success'),
    ...colorOptionToHslaLightnessScale(variables.colorWarning, 'warning'),
    ...colorOptionToHslaAlphaScale(variables.colorAlphaShade, 'blackAlpha'),
    colorText: toHSLA(variables.colorText),
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorTextSecondary: toHSLA(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.35),
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
    colorShimmer: toHSLA(variables.colorShimmer),
  });
};

// TODO:
export const createThemeOptions = (theme: Theme) => {
  const { fontSmoothing = 'auto !important' } = theme.variables || {};
  return { fontSmoothing };
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
      return [k, (numericValue * percentage).toString() + unit];
    }),
  );
};

export const createFontSizeScale = (theme: Theme): Record<keyof typeof fontSizes, string> | undefined => {
  const { fontSize } = theme.variables || {};
  if (fontSize === undefined) {
    return;
  }
  const { numericValue, unit = 'rem' } = splitCssUnit(fontSize);
  return {
    '2xs': (numericValue * 0.625).toString() + unit,
    xs: (numericValue * 0.75).toString() + unit,
    sm: (numericValue * 0.875).toString() + unit,
    md: fontSize,
    lg: (numericValue * 1.125).toString() + unit,
    xl: (numericValue * 1.25).toString() + unit,
    '2xl': (numericValue * 2).toString() + unit,
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
