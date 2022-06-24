import { Theme } from '@clerk/types';

import { blackAlpha, whiteAlpha } from '../foundations';
import { spaceScaleKeys } from '../foundations/sizes';
import { colors, removeUndefinedProps } from '../utils';
import { colorOptionToHslaScale } from './colorOptionToHslaScale';

export const createColorScales = (theme: Theme) => {
  const variables = theme.variables || {};
  return removeUndefinedProps({
    ...colorOptionToHslaScale(variables.colorPrimary, 'primary'),
    ...colorOptionToHslaScale(variables.colorDanger, 'danger'),
    ...colorOptionToHslaScale(variables.colorSuccess, 'success'),
    ...colorOptionToHslaScale(variables.colorWarning, 'warning'),
    colorText: toHSLA(variables.colorText),
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorTextSecondary: toHSLA(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.35),
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
  });
};

export const reverseAlphaScalesIfNeeded = (theme: Theme) => {
  const { alphaShadesMode = 'dark' } = theme.variables || {};
  if (alphaShadesMode === 'dark') {
    return;
  }

  return Object.fromEntries([
    ...Object.entries(whiteAlpha).map(([k, v]) => [k.replace('white', 'black'), v]),
    ...Object.entries(blackAlpha).map(([k, v]) => [k.replace('black', 'white'), v]),
  ]);
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
  const { numericValue, unit } = splitCssUnit(md);
  return {
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
  return Object.fromEntries(
    spaceScaleKeys.map(k => {
      const num = Number.parseFloat(k.replace('x', '.'));
      const percentage = (num / 0.5) * 0.125;
      return [k, (numericValue * percentage).toString() + unit];
    }),
  );
};

const splitCssUnit = (str: string) => {
  const numericValue = Number.parseFloat(str);
  const unit = str.replace(numericValue.toString(), '');
  return { numericValue, unit };
};

const percentage = (base: number, perc: number) => {
  return base + base * perc;
};
