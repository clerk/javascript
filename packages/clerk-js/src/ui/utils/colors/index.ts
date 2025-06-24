import type { HslaColor, HslaColorString } from '@clerk/types';

import { legacyColors } from './legacy';
import { hasModernColorSupport, modernColors } from './modern';

/**
 * Unified colors API that automatically chooses between modern and legacy implementations
 * based on browser support. Maintains the same interface as the legacy colors object.
 */
export const colors = {
  // Core conversion functions (from legacy, but these might need modern equivalents)
  toHslaColor: legacyColors.toHslaColor,
  toHslaString: legacyColors.toHslaString,

  // Legacy HSLA manipulation (keep for backwards compatibility)
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

/**
 * Export modern color utilities for direct use when you want to force modern CSS
 * Useful for testing or when you know the target environment supports modern CSS
 */
export { modernColors };

/**
 * Export legacy color utilities for direct use when needed
 * Useful for testing or gradual migration
 */
export { legacyColors };

/**
 * Export browser support detection
 */
export { hasModernColorSupport };

/**
 * Export unified scale generators
 */
export { generateAlphaScale, generateLightnessScale, modernScales, legacyScales } from './scales';

/**
 * Type exports
 */
export type { HslaColor, HslaColorString };
