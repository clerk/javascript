import type { Theme } from '@clerk/types';

import { spaceScaleKeys } from '../foundations/sizes';
import type { fontSizes, fontWeights } from '../foundations/typography';
import { fromEntries, removeUndefinedProps } from '../utils';
import {
  createAlphaScaleWithTransparentize,
  createColorMixLightnessScale,
  lighten,
  transparentize,
} from '../utils/colorMix';

export const createColorScales = (theme: Theme) => {
  const variables = theme.variables || {};

  const primaryScale = createColorMixLightnessScale(variables.colorPrimary, 'primary');
  const primaryBase = primaryScale?.primary500;
  const primaryAlphaScale = primaryBase ? createAlphaScaleWithTransparentize(primaryBase, 'primaryAlpha') : undefined;
  const dangerScale = createColorMixLightnessScale(variables.colorDanger, 'danger');
  const dangerBase = dangerScale?.danger500;
  const dangerAlphaScale = dangerBase ? createAlphaScaleWithTransparentize(dangerBase, 'dangerAlpha') : undefined;
  const successScale = createColorMixLightnessScale(variables.colorSuccess, 'success');
  const successBase = successScale?.success500;
  const successAlphaScale = successBase ? createAlphaScaleWithTransparentize(successBase, 'successAlpha') : undefined;
  const warningScale = createColorMixLightnessScale(variables.colorWarning, 'warning');
  const warningBase = warningScale?.warning500;
  const warningAlphaScale = warningBase ? createAlphaScaleWithTransparentize(warningBase, 'warningAlpha') : undefined;
  const neutralAlphaScales =
    typeof variables.colorNeutral === 'string' && variables.colorNeutral
      ? createAlphaScaleWithTransparentize(variables.colorNeutral, 'neutralAlpha')
      : {};

  return removeUndefinedProps({
    ...primaryScale,
    ...primaryAlphaScale,
    ...dangerScale,
    ...dangerAlphaScale,
    ...successScale,
    ...successAlphaScale,
    ...warningScale,
    ...warningAlphaScale,
    ...neutralAlphaScales,
    // TODO(Colors): We are not adjusting the lightness based on the colorPrimary lightness
    primaryHover: primaryBase ? lighten(primaryBase, '90%') : undefined,
    colorTextOnPrimaryBackground: variables.colorTextOnPrimaryBackground,
    colorText: variables.colorText,
    colorTextSecondary:
      variables.colorTextSecondary || (variables.colorText ? transparentize(variables.colorText, '35%') : undefined),
    colorInputText: variables.colorInputText,
    colorBackground: variables.colorBackground,
    colorInputBackground: variables.colorInputBackground,
    colorShimmer: variables.colorShimmer,
  });
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
