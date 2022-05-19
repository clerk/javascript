import { colorToSameTypeString, hexStringToRgbaColor, stringToHslaColor } from '@clerk/shared/utils/color';
import { DisplayThemeJSON } from '@clerk/types';

import { clerkErrorInvalidColor } from '../core/errors';

// TODO: figure out how to make this testable

export function getPrimaryColorVariations(theme: DisplayThemeJSON): string {
  const primaryHex = theme.general.color;
  const primaryHsl = stringToHslaColor(primaryHex);
  if (!primaryHsl) {
    clerkErrorInvalidColor('primary');
  }

  const { h, s, l } = primaryHsl;
  const l_l1 = 1 - (1 - l) * 0.15;
  const l_l2 = 1 - (1 - l) * 0.1;
  const l_d1 = l - l * 0.1;
  const l_d2 = l - l * 0.15;

  const { r, g, b } = hexStringToRgbaColor(primaryHex);
  return `--clerk-primary: ${primaryHex};
    --clerk-primary-rgb: ${r},${g},${b};
    --clerk-primary-d1: ${colorToSameTypeString({ h, s, l: l_d1 })};
    --clerk-primary-d2: ${colorToSameTypeString({ h, s, l: l_d2 })};
    --clerk-primary-l1: ${colorToSameTypeString({ h, s, l: l_l1 })};
    --clerk-primary-l2: ${colorToSameTypeString({ h, s, l: l_l2 })};
    --clerk-primary-a1: ${colorToSameTypeString({ h, s, l, a: 0.5 })};
    --clerk-primary-a2: ${colorToSameTypeString({ h, s, l, a: 0.25 })};`;
}

export function getFontCustomCss(theme: DisplayThemeJSON): string {
  const fontColorHex = theme.general.font_color;
  const fontColorHsl = stringToHslaColor(fontColorHex);
  if (!fontColorHsl) {
    clerkErrorInvalidColor('font');
  }
  const { h, s, l } = fontColorHsl;
  const isDarkColor = l <= 0.7;
  const modL = isDarkColor ? 1 - (1 - l) * 0.55 : l - l * 0.15;

  const { r, g, b } = hexStringToRgbaColor(fontColorHex);
  return `
    --clerk-font-family: ${theme.general.font_family};
    --clerk-font-color: ${theme.general.font_color};
    --clerk-font-color-rgb: ${r},${g},${b};
    --clerk-font-color-l1: ${colorToSameTypeString({ h, s, l: modL })};
    --clerk-label-font-weight: ${theme.general.label_font_weight};`;
}

export function getButtonCustomCss(theme: DisplayThemeJSON): string {
  return `
    --clerk-button-font-family: ${theme.buttons.font_family};
    --clerk-button-font-color: ${theme.buttons.font_color};
    --clerk-button-font-weight: ${theme.buttons.font_weight};`;
}

export function getGenericCustomCss(theme: DisplayThemeJSON): string {
  return `
    --clerk-padding-mod: ${Number.parseFloat(theme.general.padding) || 1};
    --clerk-border-radius: ${theme.general.border_radius};
    --clerk-box-shadow: ${theme.general.box_shadow};
    --clerk-background-color: ${theme.general.background_color};
    --clerk-accounts-background-color: ${theme.accounts.background_color};`;
}
