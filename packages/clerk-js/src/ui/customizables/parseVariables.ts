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
import { cssSupports } from '../utils/cssSupports';

export const createColorScales = (theme: Theme) => {
  const variables = theme.variables || {};

  const dangerScale = colorOptionToHslaLightnessScale(variables.colorDanger, 'danger');
  const primaryScale = colorOptionToHslaLightnessScale(variables.colorPrimary, 'primary');
  const successScale = colorOptionToHslaLightnessScale(variables.colorSuccess, 'success');
  const warningScale = colorOptionToHslaLightnessScale(variables.colorWarning, 'warning');

  const dangerAlphaScale = colorOptionToHslaAlphaScale(dangerScale?.danger500, 'dangerAlpha');
  const neutralAlphaScale = colorOptionToHslaAlphaScale(variables.colorNeutral, 'neutralAlpha');
  const primaryAlphaScale = colorOptionToHslaAlphaScale(primaryScale?.primary500, 'primaryAlpha');
  const successAlphaScale = colorOptionToHslaAlphaScale(successScale?.success500, 'successAlpha');
  const warningAlphaScale = colorOptionToHslaAlphaScale(warningScale?.warning500, 'warningAlpha');

  return removeUndefinedProps({
    ...dangerScale,
    ...primaryScale,
    ...successScale,
    ...warningScale,
    ...dangerAlphaScale,
    ...neutralAlphaScale,
    ...primaryAlphaScale,
    ...successAlphaScale,
    ...warningAlphaScale,
    primaryHover: primaryScale?.primary400,
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorText: toHSLA(variables.colorText),
    colorTextSecondary: toHSLA(variables.colorTextSecondary) || toTransparent(variables.colorText, 35),
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
    colorShimmer: toHSLA(variables.colorShimmer),
  });
};

export const toHSLA = (str: string | undefined) => {
  if (!str) {
    return undefined;
  }

  if (cssSupports.colorMix() || cssSupports.relativeColorSyntax()) {
    return str;
  }

  return colors.toHslaString(str);
};

const toTransparent = (str: string | undefined, percentage: number) => {
  if (!str) {
    return undefined;
  }

  if (cssSupports.colorMix()) {
    return `color-mix(in srgb, ${str}, transparent ${percentage}%)`;
  }

  return colors.makeTransparent(str, percentage / 100);
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
