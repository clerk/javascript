import { createAlphaColorMixString } from '../utils/colors/utils';
import { clerkCssVar } from '../utils/cssVariables';

const shadow = (color: string, alpha: number) =>
  clerkCssVar('color-shadow', createAlphaColorMixString(color, alpha * 100));

/**
 * Creates a complete set of shadows using the provided shadow color
 * @param shadowColor - The base color to use for shadows (defaults to black)
 * @param highlightColor - The color to use for inset highlights (defaults to white)
 * @returns Object containing all shadow definitions
 */
export const createShadowSet = (shadowColor: string = '#000000', highlightColor: string = '#FFFFFF') => {
  return {
    menuShadow: `0px 5px 15px 0px ${shadow(shadowColor, 0.08)}, 0px 15px 35px -5px ${shadow(shadowColor, 0.2)}`,
    fabShadow: `0px 12px 24px ${shadow(shadowColor, 0.32)}`,
    buttonShadow: `0px 1px 1px 0px ${shadow(highlightColor, 0.07)} inset, 0px 2px 3px 0px ${shadow(shadowColor, 0.2)}, 0px 1px 1px 0px ${shadow(shadowColor, 0.24)}`,
    cardBoxShadow: `0px 5px 15px 0px ${shadow(shadowColor, 0.08)}, 0px 15px 35px -5px ${shadow(shadowColor, 0.2)}`,
    cardContentShadow: `0px 0px 2px 0px ${shadow(shadowColor, 0.08)}, 0px 1px 2px 0px ${shadow(shadowColor, 0.06)}`,
    actionCardShadow: `0px 1px 4px 0px ${shadow(shadowColor, 0.12)}, 0px 4px 8px 0px ${shadow(shadowColor, 0.12)}`,
    outlineButtonShadow: `0px 2px 3px -1px ${shadow(shadowColor, 0.08)}, 0px 1px 0px 0px ${shadow(shadowColor, 0.02)}`,
    input: '0px 0px 1px 0px {{color}}',
    focusRing: '0px 0px 0px 4px {{color}}',
    badge: `0px 2px 0px -1px ${shadow(shadowColor, 0.04)}`,
    tableBodyShadow: `0px 0px 2px 0px ${shadow(shadowColor, 0.08)}, 0px 1px 2px 0px ${shadow(shadowColor, 0.12)}, 0px 0px 0px 1px ${shadow(shadowColor, 0.06)}`,
    segmentedControl: `0px 1px 2px 0px ${createAlphaColorMixString(shadowColor, 8)}`,
    switchControl: `0px 2px 2px -1px ${shadow(shadowColor, 0.06)}, 0px 0px 0px 1px ${shadow(shadowColor, 0.06)}, 0px 4px 4px -2px ${shadow(shadowColor, 0.06)}`,
  };
};

// Default shadows using black shadow color
export const shadows = Object.freeze(createShadowSet());
