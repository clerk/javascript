import type { ColorScale, CssColorOrScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { COLOR_SCALE, createEmptyColorScale, generateAlphaColorMix } from './utils';

/**
 * Generates an alpha color scale using modern CSS color-mix when supported
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with alpha variations
 */
export function generateAlphaScale(
  color: string | ColorScale<string> | CssColorOrScale | undefined,
): ColorScale<string> {
  // Return empty scale if no color provided
  if (!color) {
    return createEmptyColorScale() as ColorScale<string>;
  }

  // If already a color scale object, return it as-is
  if (typeof color !== 'string') {
    return { ...createEmptyColorScale(), ...color } as ColorScale<string>;
  }

  // For string input, generate scale using modern CSS if supported
  if (cssSupports.colorMix()) {
    return generateModernAlphaScale(color);
  }

  // Return empty scale if modern CSS not supported (fallback handled elsewhere)
  return createEmptyColorScale() as ColorScale<string>;
}

/**
 * Generates alpha scale using CSS color-mix
 * @param baseColor - Base color string
 * @returns Color scale with alpha variations using color-mix
 */
function generateModernAlphaScale(baseColor: string): ColorScale<string> {
  const scale = createEmptyColorScale();

  // Generate alpha variations for each shade
  COLOR_SCALE.forEach(shade => {
    scale[shade] = generateAlphaColorMix(baseColor, shade);
  });

  return scale as ColorScale<string>;
}
