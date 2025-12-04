import type { HslaColor } from '@clerk/shared/types';

import { cssSupports } from '../cssSupports';
import { colors as legacyColors } from './legacy';
import { colors as modernColors } from './modern';

export const colors = {
  /**
   * Changes the lightness value of an HSLA color object
   * @param color - The HSLA color object to modify
   * @param lightness - The new lightness value (0-100)
   * @returns A new HSLA color object with the modified lightness
   * @example
   * ```typescript
   * const darkColor = colors.changeHslaLightness({ h: 200, s: 50, l: 80, a: 1 }, 20);
   * ```
   */
  changeHslaLightness: legacyColors.changeHslaLightness,

  /**
   * Sets the alpha (opacity) value of an HSLA color object
   * @param color - The HSLA color object to modify
   * @param alpha - The new alpha value (0-1)
   * @returns A new HSLA color object with the modified alpha
   * @example
   * ```typescript
   * const semiTransparent = colors.setHslaAlpha({ h: 200, s: 50, l: 50, a: 1 }, 0.5);
   * ```
   */
  setHslaAlpha: legacyColors.setHslaAlpha,

  /**
   * Converts a color string to either a string (modern CSS) or HSLA object (legacy)
   * Uses modern CSS features when supported, falls back to parsing the string into an HSLA object for older browsers
   * @param color - CSS color string (hex, rgb, hsl, `var(--color)`, etc.) or undefined
   * @returns Color string in modern browsers, HSLA object in legacy browsers, or undefined if input is undefined
   * @example
   * ```typescript
   * const processedColor = colors.toHslaColor('#ff0000'); // '#ff0000' or { h: 0, s: 100, l: 50, a: 1 }
   * const noColor = colors.toHslaColor(undefined); // undefined
   * ```
   */
  toHslaColor: (color: string | undefined): string | HslaColor | undefined => {
    if (!color) {
      return undefined;
    }
    return cssSupports.modernColor() ? color : legacyColors.toHslaColor(color);
  },

  /**
   * Converts a color (string or HSLA object) to a CSS string representation
   * @param color - CSS color string, HSLA object, or undefined
   * @returns CSS color string or undefined if input is undefined
   * @example
   * ```typescript
   * const cssColor = colors.toHslaString('#ff0000'); // '#ff0000' or 'hsla(0, 100%, 50%, 1)'
   * const hslaColor = colors.toHslaString({ h: 200, s: 50, l: 50, a: 1 }); // 'hsla(200, 50%, 50%, 1)'
   * ```
   */
  toHslaString: (color: string | HslaColor | undefined): string | undefined => {
    if (!color) {
      return undefined;
    }
    if (cssSupports.modernColor() && typeof color === 'string') {
      return color;
    }
    return legacyColors.toHslaString(color);
  },

  /**
   * Creates a lighter version of the given color
   * Uses modern CSS relative color syntax when supported, falls back to HSLA manipulation
   * @param color - CSS color string or undefined
   * @param percentage - How much lighter to make the color (0-100, default: 0)
   * @returns Lightened color string or undefined if input is undefined
   * @example
   * ```typescript
   * const lightBlue = colors.lighten('#0066cc', 20); // 20% lighter blue
   * const noChange = colors.lighten('#0066cc'); // Same color (0% change)
   * ```
   */
  lighten: (color: string | undefined, percentage = 0): string | undefined => {
    if (cssSupports.modernColor()) {
      return modernColors.lighten(color, percentage);
    }
    return legacyColors.lighten(color, percentage);
  },

  /**
   * Creates a transparent version of the given color by reducing its opacity
   * Uses modern CSS color-mix function when supported, falls back to HSLA alpha manipulation
   * @param color - CSS color string or undefined
   * @param percentage - How much transparency to add (0-100, default: 0)
   * @returns Color with reduced opacity or undefined if input is undefined
   * @example
   * ```typescript
   * const semiTransparent = colors.makeTransparent('#ff0000', 50); // 50% transparent red
   * const opaque = colors.makeTransparent('#ff0000'); // Same color (0% transparency)
   * ```
   */
  makeTransparent: (color: string | undefined, percentage = 0): string | undefined => {
    if (cssSupports.modernColor()) {
      return modernColors.makeTransparent(color, percentage);
    }
    return legacyColors.makeTransparent(color, percentage);
  },

  /**
   * Removes transparency from a color, making it fully opaque
   * Uses modern CSS features when supported, falls back to HSLA alpha manipulation
   * @param color - CSS color string or undefined
   * @returns Fully opaque version of the color or undefined if input is undefined
   * @example
   * ```typescript
   * const solid = colors.makeSolid('rgba(255, 0, 0, 0.5)'); // Fully opaque red
   * const alreadySolid = colors.makeSolid('#ff0000'); // Same color (already opaque)
   * ```
   */
  makeSolid: (color: string | undefined): string | undefined => {
    if (cssSupports.modernColor()) {
      return modernColors.makeSolid(color);
    }
    return legacyColors.makeSolid(color);
  },

  /**
   * Sets the alpha (opacity) value of a color
   * Uses modern CSS relative color syntax when supported, falls back to HSLA manipulation
   * @param color - CSS color string (required)
   * @param alpha - Alpha value between 0 (transparent) and 1 (opaque)
   * @returns Color string with the specified alpha value
   * @throws {Error} When color is not provided
   * @example
   * ```typescript
   * const halfTransparent = colors.setAlpha('#ff0000', 0.5); // 50% transparent red
   * const fullyOpaque = colors.setAlpha('rgba(255, 0, 0, 0.3)', 1); // Fully opaque red
   * ```
   */
  setAlpha: (color: string, alpha: number): string => {
    if (cssSupports.modernColor()) {
      return modernColors.setAlpha(color, alpha);
    }
    return legacyColors.setAlpha(color, alpha);
  },

  /**
   * Adjusts a color's lightness for better contrast or visual hierarchy
   * Uses modern CSS relative color syntax when supported, falls back to HSLA manipulation
   * @param color - CSS color string or undefined
   * @param lightness - Lightness adjustment amount (default: 5)
   * @returns Color with adjusted lightness or undefined if input is undefined
   * @example
   * ```typescript
   * const adjusted = colors.adjustForLightness('#333333', 10); // Slightly lighter dark gray
   * const subtle = colors.adjustForLightness('#666666'); // Subtle lightness adjustment (5 units)
   * ```
   */
  adjustForLightness: (color: string | undefined, lightness = 5): string | undefined => {
    if (cssSupports.modernColor()) {
      return modernColors.adjustForLightness(color, lightness);
    }
    return legacyColors.adjustForLightness(color, lightness);
  },
};

export { legacyColors, modernColors };
