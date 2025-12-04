import { createAlphaColorMixString } from '../utils/colors/utils';
import { cssSupports } from '../utils/cssSupports';
import { clerkCssVar } from '../utils/cssVariables';

type ShadowGenerator = (color: string, alpha: number) => string;

const generateShadow =
  (fn: (color: string, alpha: number) => string): ShadowGenerator =>
  (color: string, alpha: number) =>
    cssSupports.modernColor() ? fn(color, alpha) : `rgba(0, 0, 0, ${alpha})`;

/**
 * Creates a complete set of shadows using the provided shadow color
 * @param shadowColor - The base color to use for shadows (defaults to black)
 * @param shadowGenerator - Function to generate shadow colors with alpha (defaults to CSS variable-based generator)
 * @returns Object containing all shadow definitions
 */
export const createShadowSet = (
  shadowColor: string = '#000000',
  shadowGenerator: ShadowGenerator = generateShadow((color, alpha) =>
    createAlphaColorMixString(clerkCssVar('color-shadow', color), alpha * 100),
  ),
) => {
  const highlightColor = '#FFFFFF';
  return {
    menuShadow: `0px 5px 15px 0px ${shadowGenerator(shadowColor, 0.08)}, 0px 15px 35px -5px ${shadowGenerator(shadowColor, 0.2)}`,
    fabShadow: `0px 12px 24px ${shadowGenerator(shadowColor, 0.32)}`,
    buttonShadow: `0px 1px 1px 0px ${shadowGenerator(highlightColor, 0.07)} inset, 0px 2px 3px 0px ${shadowGenerator(shadowColor, 0.2)}, 0px 1px 1px 0px ${shadowGenerator(shadowColor, 0.24)}`,
    cardBoxShadow: `0px 5px 15px 0px ${shadowGenerator(shadowColor, 0.08)}, 0px 15px 35px -5px ${shadowGenerator(shadowColor, 0.2)}`,
    cardContentShadow: `0px 0px 2px 0px ${shadowGenerator(shadowColor, 0.08)}, 0px 1px 2px 0px ${shadowGenerator(shadowColor, 0.06)}`,
    actionCardShadow: `0px 1px 4px 0px ${shadowGenerator(shadowColor, 0.12)}, 0px 4px 8px 0px ${shadowGenerator(shadowColor, 0.12)}`,
    outlineButtonShadow: `0px 2px 3px -1px ${shadowGenerator(shadowColor, 0.08)}, 0px 1px 0px 0px ${shadowGenerator(shadowColor, 0.02)}`,
    input: '0px 0px 1px 0px {{color}}',
    focusRing: '0px 0px 0px 4px {{color}}',
    badge: `0px 2px 0px -1px ${shadowGenerator(shadowColor, 0.04)}`,
    tableBodyShadow: `0px 0px 2px 0px ${shadowGenerator(shadowColor, 0.08)}, 0px 1px 2px 0px ${shadowGenerator(shadowColor, 0.12)}, 0px 0px 0px 1px ${shadowGenerator(shadowColor, 0.06)}`,
    segmentedControl: `0px 1px 2px 0px ${shadowGenerator(shadowColor, 0.08)}`,
    switchControl: `0px 2px 2px -1px ${shadowGenerator(shadowColor, 0.06)}, 0px 0px 0px 1px ${shadowGenerator(shadowColor, 0.06)}, 0px 4px 4px -2px ${shadowGenerator(shadowColor, 0.06)}`,
  };
};

// Default shadows using black shadow color
export const shadows = Object.freeze(createShadowSet());

// Export the generator functions for use in other modules
export { generateShadow };
