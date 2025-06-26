import type { HslaColor } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { colors as legacyColors } from './legacy';
import { colors as modernColors } from './modern';

const hasModernColorSupport = cssSupports.hasModernColorSupport;

export const colors = {
  toHslaColor: (color: string | undefined): string | HslaColor | undefined => {
    if (!color) return undefined;
    if (hasModernColorSupport()) {
      return color;
    }
    return legacyColors.toHslaColor(color);
  },
  toHslaString: (color: HslaColor | string | undefined): string | undefined => {
    if (!color) return undefined;
    if (hasModernColorSupport() && typeof color === 'string') {
      return color;
    }
    return legacyColors.toHslaString(color);
  },

  changeHslaLightness: legacyColors.changeHslaLightness,
  setHslaAlpha: legacyColors.setHslaAlpha,

  // High-level utilities with automatic modern/legacy selection
  lighten: (color: string | undefined, percentage = 0): string | undefined => {
    if (hasModernColorSupport()) {
      return modernColors.lighten(color, percentage);
    }
    return legacyColors.lighten(color, percentage);
  },

  makeTransparent: (color: string | undefined, percentage = 0): string | undefined => {
    if (hasModernColorSupport()) {
      return modernColors.makeTransparent(color, percentage);
    }
    return legacyColors.makeTransparent(color, percentage);
  },

  makeSolid: (color: string | undefined): string | undefined => {
    if (hasModernColorSupport()) {
      return modernColors.makeSolid(color);
    }
    return legacyColors.makeSolid(color);
  },

  setAlpha: (color: string, alpha: number): string => {
    if (hasModernColorSupport()) {
      return modernColors.setAlpha(color, alpha);
    }
    return legacyColors.setAlpha(color, alpha);
  },

  adjustForLightness: (color: string | undefined, lightness = 5): string | undefined => {
    if (hasModernColorSupport()) {
      return modernColors.adjustForLightness(color, lightness);
    }
    return legacyColors.adjustForLightness(color, lightness);
  },
};

export { modernColors, legacyColors, hasModernColorSupport };
export { generateAlphaScale, generateLightnessScale, modernScales, legacyScales } from './scales';
