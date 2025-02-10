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

  const primaryScale = colorOptionToHslaLightnessScale(variables.colorPrimary, 'primary');
  const primaryAlphaScale = colorOptionToHslaAlphaScale(primaryScale?.primary500, 'primaryAlpha');
  const dangerScale = colorOptionToHslaLightnessScale(variables.colorDanger, 'danger');
  const dangerAlphaScale = colorOptionToHslaAlphaScale(dangerScale?.danger500, 'dangerAlpha');
  const successScale = colorOptionToHslaLightnessScale(variables.colorSuccess, 'success');
  const successAlphaScale = colorOptionToHslaAlphaScale(successScale?.success500, 'successAlpha');
  const warningScale = colorOptionToHslaLightnessScale(variables.colorWarning, 'warning');
  const warningAlphaScale = colorOptionToHslaAlphaScale(warningScale?.warning500, 'warningAlpha');

  return removeUndefinedProps({
    ...primaryScale,
    ...primaryAlphaScale,
    ...dangerScale,
    ...dangerAlphaScale,
    ...successScale,
    ...successAlphaScale,
    ...warningScale,
    ...warningAlphaScale,
    ...colorOptionToHslaAlphaScale(variables.colorNeutral, 'neutralAlpha'),
    primaryHover: colors.adjustForLightness(primaryScale?.primary500),
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorText: toHSLA(variables.colorText),
    colorTextSecondary: toHSLA(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.35),
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
    colorShimmer: toHSLA(variables.colorShimmer),
  });
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
    sm: (numericValue * 0.66).toString() + unit,
    md,
    lg: (numericValue * 1.33).toString() + unit,
    xl: (numericValue * 2).toString() + unit,
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

const splitCssUnit = (str: string) => {
  const numericValue = Number.parseFloat(str);
  const unit = str.replace(numericValue.toString(), '') || undefined;
  return { numericValue, unit };
};
