import type { Theme } from '@clerk/types';

import { spaceScaleKeys } from '../foundations/sizes';
import type { fontWeights } from '../foundations/typography';
import { colors } from '../utils/colors';
import { colorOptionToThemedAlphaScale, colorOptionToThemedLightnessScale } from '../utils/colors/scales';
import { cssSupports } from '../utils/cssSupports';
import { fromEntries } from '../utils/fromEntries';
import { removeUndefinedProps } from '../utils/removeUndefinedProps';
import { createShadowSet } from '../foundations/shadows';

export const createColorScales = (theme: Theme) => {
  const variables = removeInvalidValues(theme.variables || {});

  const dangerScale = colorOptionToThemedLightnessScale(variables.colorDanger, 'danger');
  const primaryScale = colorOptionToThemedLightnessScale(variables.colorPrimary, 'primary');
  const successScale = colorOptionToThemedLightnessScale(variables.colorSuccess, 'success');
  const warningScale = colorOptionToThemedLightnessScale(variables.colorWarning, 'warning');

  const dangerAlphaScale = colorOptionToThemedAlphaScale(dangerScale?.danger500, 'dangerAlpha');
  const neutralAlphaScale = colorOptionToThemedAlphaScale(variables.colorNeutral, 'neutralAlpha');
  const primaryAlphaScale = colorOptionToThemedAlphaScale(primaryScale?.primary500, 'primaryAlpha');
  const successAlphaScale = colorOptionToThemedAlphaScale(successScale?.success500, 'successAlpha');
  const warningAlphaScale = colorOptionToThemedAlphaScale(warningScale?.warning500, 'warningAlpha');

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
    primaryHover: colors.adjustForLightness(primaryScale?.primary500),
    colorPrimaryForeground: variables.colorPrimaryForeground
      ? colors.toHslaString(variables.colorPrimaryForeground)
      : variables.colorTextOnPrimaryBackground
        ? colors.toHslaString(variables.colorTextOnPrimaryBackground)
        : undefined,
    colorForeground: variables.colorForeground
      ? colors.toHslaString(variables.colorForeground)
      : colors.toHslaString(variables.colorText),
    colorMutedForeground: variables.colorMutedForeground
      ? colors.toHslaString(variables.colorMutedForeground)
      : variables.colorTextSecondary
        ? colors.toHslaString(variables.colorTextSecondary)
        : colors.makeTransparent(variables.colorText, 0.35),
    colorInputForeground: variables.colorInputForeground
      ? colors.toHslaString(variables.colorInputForeground)
      : colors.toHslaString(variables.colorInputText),
    colorBackground: colors.toHslaString(variables.colorBackground),
    colorInput: variables.colorInput
      ? colors.toHslaString(variables.colorInput)
      : colors.toHslaString(variables.colorInputBackground),
    colorShimmer: colors.toHslaString(variables.colorShimmer),
    colorMuted: variables.colorMuted ? colors.toHslaString(variables.colorMuted) : undefined,
    colorRing: variables.colorRing ? colors.toHslaString(variables.colorRing) : undefined,
    colorShadow: variables.colorShadow ? colors.toHslaString(variables.colorShadow) : undefined,
  });
};

export const removeInvalidValues = (variables: NonNullable<Theme['variables']>): NonNullable<Theme['variables']> => {
  // Check for modern color support. If present, we can simply return the variables as-is since we support everything
  // CSS supports.
  if (cssSupports.modernColor()) {
    return variables;
  }

  // If not, we need to remove any values that are specified with CSS variables, as our color scale generation only
  // supports CSS variables using modern CSS functionality.
  const validVariables: Theme['variables'] = Object.fromEntries(
    Object.entries(variables).filter(([key, value]) => {
      if (typeof value === 'string') {
        const isValid = !value.startsWith('var(');
        if (!isValid) {
          console.warn(
            `Invalid color value: ${value} for key: ${key}, using default value instead. Using CSS variables is not supported in this browser.`,
          );
        }
        return isValid;
      }

      if (typeof value === 'object') {
        return Object.entries(value).every(([key, value]) => {
          if (typeof value !== 'string') return true;

          const isValid = !value.startsWith('var(');
          if (!isValid) {
            console.warn(
              `Invalid color value: ${value} for key: ${key}, using default value instead. Using CSS variables is not supported in this browser.`,
            );
          }

          return isValid;
        });
      }

      return false;
    }),
  );

  return validVariables;
};

export const createRadiiUnits = (theme: Theme) => {
  const { borderRadius } = theme.variables || {};
  if (borderRadius === undefined) {
    return;
  }

  const md = borderRadius === 'none' ? '0' : borderRadius;
  return {
    sm: `calc(${md} * 0.66)`,
    md,
    lg: `calc(${md} * 1.33)`,
    xl: `calc(${md} * 2)`,
  };
};

export const createSpaceScale = (theme: Theme) => {
  const { spacing, spacingUnit } = theme.variables || {};
  const spacingValue = spacing ?? spacingUnit;
  if (spacingValue === undefined) {
    return;
  }
  return fromEntries(
    spaceScaleKeys.map(k => {
      const num = Number.parseFloat(k.replace('x', '.'));
      const percentage = (num / 0.5) * 0.125;
      return [k, `calc(${spacingValue} * ${percentage})`];
    }),
  );
};

// Font size scale constants that match the default theme foundations
// These ratios are used consistently across the design system
const FONT_SIZE_SCALE_RATIOS = {
  xs: 0.8,
  sm: 0.9,
  md: 1,
  lg: 1.3,
  xl: 1.85,
} as const;

type FontSizeKey = keyof typeof FONT_SIZE_SCALE_RATIOS;

// We want to keep the same ratio between the font sizes we have for the default theme
// This is directly related to the fontSizes object in the theme default foundations
// ref: src/ui/foundations/typography.ts
export const createFontSizeScale = (theme: Theme): Partial<Record<FontSizeKey, string>> | undefined => {
  const { fontSize } = theme.variables || {};
  if (fontSize === undefined) {
    return;
  }

  if (typeof fontSize === 'object') {
    // When fontSize is an object, filter out undefined values and return only defined properties
    return removeUndefinedProps(
      Object.fromEntries(
        Object.entries(FONT_SIZE_SCALE_RATIOS).map(([key, _ratio]) => [key, fontSize[key as FontSizeKey] ?? undefined]),
      ) as Record<FontSizeKey, string | undefined>,
    );
  }

  // When fontSize is a string, calculate all sizes based on the base value and ratios
  return Object.fromEntries(
    Object.entries(FONT_SIZE_SCALE_RATIOS).map(([key, ratio]) => [
      key,
      ratio === 1 ? fontSize : `calc(${fontSize} * ${ratio})`,
    ]),
  ) as Record<FontSizeKey, string>;
};

export const createFontWeightScale = (theme: Theme): Partial<Record<keyof typeof fontWeights, string | number>> => {
  const { fontWeight } = theme.variables || {};
  return removeUndefinedProps({ ...fontWeight });
};

export const createFonts = (theme: Theme) => {
  const { fontFamily, fontFamilyButtons } = theme.variables || {};
  return removeUndefinedProps({ main: fontFamily, buttons: fontFamilyButtons });
};

export const createShadowsUnits = (theme: Theme) => {
  const { colorShadow } = theme.variables || {};
  if (!colorShadow) {
    return;
  }

  const shadowColor = colors.toHslaString(colorShadow);
  if (!shadowColor) {
    return;
  }

  // Use the shared shadow creation function with the custom shadow color
  return createShadowSet(shadowColor);
};
