import type { ColorScale, CssColorOrScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { COLOR_SCALE, createEmptyColorScale, getColorMix } from './utils';

/**
 * Generates a lightness color scale using modern CSS when supported
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with lightness variations
 */
export function generateLightnessScale(color: CssColorOrScale | undefined): ColorScale<string | undefined> {
  // Return empty scale if no color provided
  if (!color) {
    return createEmptyColorScale();
  }

  // If already a color scale object, merge with empty scale
  if (typeof color !== 'string') {
    return { ...createEmptyColorScale(), ...color };
  }

  // For string input, generate scale using modern CSS if supported
  if (cssSupports.relativeColorSyntax() || cssSupports.colorMix()) {
    return generateModernLightnessScale(color);
  }

  // Return empty scale if modern CSS not supported (fallback handled elsewhere)
  return createEmptyColorScale();
}

/**
 * Generates lightness scale using modern CSS (relative color syntax or color-mix)
 * @param baseColor - Base color string
 * @returns Color scale with lightness variations using modern CSS
 */
function generateModernLightnessScale(baseColor: string): ColorScale<string | undefined> {
  const scale = createEmptyColorScale();

  // Generate lightness variations for each shade
  COLOR_SCALE.forEach(shade => {
    scale[shade] = getColorMix(baseColor, shade);
  });

  return scale;
}
