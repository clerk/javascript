/**
 * Caching and memoization utilities for color operations
 * Provides performance optimizations through intelligent caching
 */

import type { ColorScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { COLOR_SCALE } from './constants';

// Memoization cache for expensive operations
const memoCache = new Map<string, any>();

/**
 * Memoize function results to avoid repeated expensive calculations
 */
function memoize<T extends (...args: any[]) => any>(fn: T, keyFn?: (...args: Parameters<T>) => string): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (memoCache.has(key)) {
      return memoCache.get(key);
    }

    const result = fn(...args);
    memoCache.set(key, result);
    return result;
  }) as T;
}

/**
 * Cache for browser support detection - only check once per session
 */
let modernColorSupportCache: boolean | null = null;

export const hasModernColorSupport = (): boolean => {
  if (modernColorSupportCache === null) {
    modernColorSupportCache = cssSupports.colorMix() || cssSupports.relativeColorSyntax();
  }
  return modernColorSupportCache;
};

/**
 * Pre-computed empty color scale to avoid object creation
 */
const EMPTY_COLOR_SCALE: ColorScale<string | undefined> = Object.freeze({
  '25': undefined,
  '50': undefined,
  '100': undefined,
  '150': undefined,
  '200': undefined,
  '300': undefined,
  '400': undefined,
  '500': undefined,
  '600': undefined,
  '700': undefined,
  '750': undefined,
  '800': undefined,
  '850': undefined,
  '900': undefined,
  '950': undefined,
});

/**
 * Fast empty color scale creation - returns pre-computed frozen object
 */
export const createEmptyColorScale = (): ColorScale<string | undefined> => {
  return { ...EMPTY_COLOR_SCALE };
};

/**
 * Memoized color string generators for better performance
 */
export const memoizedColorGenerators = {
  /**
   * Memoized color-mix generator
   */
  colorMix: memoize(
    (baseColor: string, mixColor: string, percentage: number): string =>
      `color-mix(in srgb, ${baseColor}, ${mixColor} ${percentage}%)`,
    (baseColor, mixColor, percentage) => `mix:${baseColor}:${mixColor}:${percentage}`,
  ),

  /**
   * Memoized relative color syntax generator
   */
  relativeColor: memoize(
    (color: string, hue: string, saturation: string, lightness: string, alpha?: string): string =>
      `hsl(from ${color} ${hue} ${saturation} ${lightness}${alpha ? ` / ${alpha}` : ''})`,
    (color, h, s, l, a) => `rel:${color}:${h}:${s}:${l}:${a || ''}`,
  ),

  /**
   * Memoized alpha color-mix generator
   */
  alphaColorMix: memoize(
    (color: string, alphaPercentage: number): string => `color-mix(in srgb, transparent, ${color} ${alphaPercentage}%)`,
    (color, alpha) => `alpha:${color}:${alpha}`,
  ),
};

/**
 * Batch color scale generation for better performance
 */
export function batchGenerateColorScale<T>(
  baseColor: string,
  generator: (color: string, shade: keyof ColorScale<any>) => T,
): ColorScale<T> {
  const scale = createEmptyColorScale() as ColorScale<T>;

  // Use for loop for better performance than forEach
  for (let i = 0; i < COLOR_SCALE.length; i++) {
    const shade = COLOR_SCALE[i].toString() as keyof ColorScale<any>;
    scale[shade] = generator(baseColor, shade);
  }

  return scale;
}

/**
 * Clear memoization cache (useful for testing or memory management)
 */
export function clearMemoCache(): void {
  memoCache.clear();
  modernColorSupportCache = null;
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { size: number; modernSupport: boolean | null } {
  return {
    size: memoCache.size,
    modernSupport: modernColorSupportCache,
  };
}
