import type { Theme } from '@clerk/types';

import { spaceScaleKeys } from '../foundations/sizes';
import type { fontSizes, fontWeights } from '../foundations/typography';
import { colors } from '../utils/colors';
import { colorOptionToThemedAlphaScale, colorOptionToThemedLightnessScale } from '../utils/colors/scales';
import { cssSupports } from '../utils/cssSupports';
import { fromEntries } from '../utils/fromEntries';
import { removeUndefinedProps } from '../utils/removeUndefinedProps';

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
    colorText: colors.toHslaString(variables.colorText),
    colorTextSecondary:
      colors.toHslaString(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.35),
    colorInputText: colors.toHslaString(variables.colorInputText),
    colorBackground: colors.toHslaString(variables.colorBackground),
    colorInputBackground: colors.toHslaString(variables.colorInputBackground),
    colorShimmer: colors.toHslaString(variables.colorShimmer),
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
  const { spacingUnit } = theme.variables || {};
  if (spacingUnit === undefined) {
    return;
  }
  return fromEntries(
    spaceScaleKeys.map(k => {
      const num = Number.parseFloat(k.replace('x', '.'));
      const percentage = (num / 0.5) * 0.125;
      return [k, `calc(${spacingUnit} * ${percentage})`];
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
  return {
    xs: `calc(${fontSize} * 0.8)`,
    sm: `calc(${fontSize} * 0.9)`,
    md: fontSize,
    lg: `calc(${fontSize} * 1.3)`,
    xl: `calc(${fontSize} * 1.85)`,
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
