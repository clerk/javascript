/**
 * Modern CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */

import { cssSupports } from '../cssSupports';
import { hasModernColorSupport as hasModernColorSupportCached } from './cache';

/**
 * Modern CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */
export const modernColors = {
  /**
   * Lightens a color by a percentage using modern CSS
   */
  lighten: (color: string | undefined, percentage = 0): string | undefined => {
    if (!color) return undefined;

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax for precise lightness control
      const lightnessIncrease = percentage * 100; // Convert to percentage
      return `hsl(from ${color} h s calc(l + ${lightnessIncrease}%))`;
    }

    if (cssSupports.colorMix()) {
      // Use color-mix as fallback
      const mixPercentage = Math.min(percentage * 100, 95); // Cap at 95%
      return `color-mix(in srgb, ${color}, white ${mixPercentage}%)`;
    }

    return color; // Return original if no modern CSS support
  },

  /**
   * Makes a color transparent by a percentage using modern CSS
   */
  makeTransparent: (color: string | undefined, percentage = 0): string | undefined => {
    if (!color || color.toString() === '') return undefined;

    if (cssSupports.colorMix()) {
      // Use color-mix with transparent
      const alphaPercentage = Math.max((1 - percentage) * 100, 5); // Minimum 5% opacity
      return `color-mix(in srgb, transparent, ${color} ${alphaPercentage}%)`;
    }

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax to adjust alpha
      const alphaValue = Math.max(1 - percentage, 0.05); // Minimum 5% opacity
      return `hsl(from ${color} h s l / ${alphaValue})`;
    }

    return color; // Return original if no modern CSS support
  },

  /**
   * Makes a color completely opaque using modern CSS
   */
  makeSolid: (color: string | undefined): string | undefined => {
    if (!color) return undefined;

    if (cssSupports.relativeColorSyntax()) {
      // Set alpha to 1 using relative color syntax
      return `hsl(from ${color} h s l / 1)`;
    }

    if (cssSupports.colorMix()) {
      // Mix with itself at 100% to remove transparency
      return `color-mix(in srgb, ${color}, ${color} 100%)`;
    }

    return color; // Return original if no modern CSS support
  },

  /**
   * Sets the alpha value of a color using modern CSS
   */
  setAlpha: (color: string, alpha: number): string => {
    if (!color.toString()) return color;

    const clampedAlpha = Math.min(Math.max(alpha, 0), 1);

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax for precise alpha control
      return `hsl(from ${color} h s l / ${clampedAlpha})`;
    }

    if (cssSupports.colorMix()) {
      // Use color-mix with transparent
      const percentage = clampedAlpha * 100;
      return `color-mix(in srgb, transparent, ${color} ${percentage}%)`;
    }

    return color; // Return original if no modern CSS support
  },

  /**
   * Adjusts color for better contrast/lightness using modern CSS
   */
  adjustForLightness: (color: string | undefined, lightness = 5): string | undefined => {
    if (!color) return undefined;

    if (cssSupports.relativeColorSyntax()) {
      // Use relative color syntax for precise lightness adjustment
      // Special handling for very light colors
      return `hsl(from ${color} h s calc(max(l + ${lightness * 2}%, 95%)))`;
    }

    if (cssSupports.colorMix()) {
      // Use color-mix with white for lightness adjustment
      const mixPercentage = Math.min(lightness * 4, 30); // Cap adjustment
      return `color-mix(in srgb, ${color}, white ${mixPercentage}%)`;
    }

    return color; // Return original if no modern CSS support
  },
};

/**
 * Determines if modern CSS color manipulation is supported
 * Now uses cached version for better performance
 */
export function hasModernColorSupport(): boolean {
  return hasModernColorSupportCached();
}
