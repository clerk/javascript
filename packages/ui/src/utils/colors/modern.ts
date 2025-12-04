/**
 * CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */

import { cssSupports } from '../cssSupports';
import { COLOR_BOUNDS, MODERN_CSS_LIMITS } from './constants';
import { createAlphaColorMixString, createColorMixString, createRelativeColorString } from './utils';

/**
 * CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */
export const colors = {
  /**
   * Lightens a color by a percentage
   */
  lighten: (color: string | undefined, percentage = 0): string | undefined => {
    if (!color) {
      return undefined;
    }

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax for precise lightness control
      const lightnessIncrease = percentage * 100; // Convert to percentage
      return createRelativeColorString(color, 'h', 's', `calc(l + ${lightnessIncrease}%)`);
    }

    if (cssSupports.colorMix()) {
      // Use color-mix as fallback
      const mixPercentage = Math.min(percentage * 100, MODERN_CSS_LIMITS.MAX_LIGHTNESS_MIX);
      return createColorMixString(color, 'white', mixPercentage);
    }

    return color; // Return original if no CSS support
  },

  /**
   * Makes a color transparent by a percentage
   */
  makeTransparent: (color: string | undefined, percentage = 0): string | undefined => {
    if (!color || color.toString() === '') {
      return undefined;
    }

    if (cssSupports.colorMix()) {
      const alphaPercentage = Math.max((1 - percentage) * 100, MODERN_CSS_LIMITS.MIN_ALPHA_PERCENTAGE);
      return createAlphaColorMixString(color, alphaPercentage);
    }

    return color; // Return original if no CSS support
  },

  /**
   * Makes a color completely opaque
   */
  makeSolid: (color: string | undefined): string | undefined => {
    if (!color) {
      return undefined;
    }

    if (cssSupports.relativeColorSyntax()) {
      // Set alpha to 1 using relative color syntax
      return createRelativeColorString(color, 'h', 's', 'l', '1');
    }

    if (cssSupports.colorMix()) {
      // Mix with itself at 100% to remove transparency
      return `color-mix(in srgb, ${color}, ${color} 100%)`;
    }

    return color; // Return original if no CSS support
  },

  /**
   * Sets the alpha value of a color
   */
  setAlpha: (color: string, alpha: number): string => {
    const clampedAlpha = Math.min(Math.max(alpha, COLOR_BOUNDS.alpha.min), COLOR_BOUNDS.alpha.max);

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax for precise alpha control
      return createRelativeColorString(color, 'h', 's', 'l', clampedAlpha.toString());
    }

    if (cssSupports.colorMix()) {
      // Use color-mix with transparent
      const percentage = clampedAlpha * 100;
      return createAlphaColorMixString(color, percentage);
    }

    return color; // Return original if no CSS support
  },

  /**
   * Adjusts color for better contrast/lightness
   */
  adjustForLightness: (color: string | undefined, lightness = 5): string | undefined => {
    if (!color) {
      return undefined;
    }

    if (cssSupports.colorMix()) {
      // Use color-mix with white for lightness adjustment - more conservative approach
      const mixPercentage = Math.min(
        lightness * MODERN_CSS_LIMITS.MIX_MULTIPLIER,
        MODERN_CSS_LIMITS.MAX_LIGHTNESS_ADJUSTMENT,
      );
      return createColorMixString(color, 'white', mixPercentage);
    }

    return color; // Return original if no CSS support
  },
};
