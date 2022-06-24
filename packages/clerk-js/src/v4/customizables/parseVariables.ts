import { Theme } from '@clerk/types';

import { blackAlpha, whiteAlpha } from '../foundations';
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
  const mdNum = Number.parseFloat(md);
  const mdUnit = md.replace(mdNum.toString(), '');
  return {
    md,
    lg: percentage(mdNum, 0.35).toString() + mdUnit,
    xl: percentage(mdNum, 1.7).toString() + mdUnit,
    '2xl': percentage(mdNum, 2.35).toString() + mdUnit,
  };
};

const percentage = (base: number, perc: number) => {
  return base + base * perc;
};
