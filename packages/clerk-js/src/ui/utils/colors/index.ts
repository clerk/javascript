import type { HslaColor } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { colors as legacyColors } from './legacy';
import { colors as modernColors } from './modern';

const hasModernColorSupport = cssSupports.hasModernColorSupport;

export const colors = hasModernColorSupport()
  ? {
      toHslaColor: (color: string | undefined): string | HslaColor | undefined => {
        if (!color) return undefined;
        return color;
      },
      toHslaString: (color: HslaColor | string | undefined): string | undefined => {
        if (!color) return undefined;
        if (typeof color === 'string') {
          return color;
        }
        return legacyColors.toHslaString(color);
      },
      changeHslaLightness: legacyColors.changeHslaLightness,
      setHslaAlpha: legacyColors.setHslaAlpha,
      lighten: modernColors.lighten,
      makeTransparent: modernColors.makeTransparent,
      makeSolid: modernColors.makeSolid,
      setAlpha: modernColors.setAlpha,
      adjustForLightness: modernColors.adjustForLightness,
    }
  : {
      toHslaColor: legacyColors.toHslaColor,
      toHslaString: legacyColors.toHslaString,
      changeHslaLightness: legacyColors.changeHslaLightness,
      setHslaAlpha: legacyColors.setHslaAlpha,
      lighten: legacyColors.lighten,
      makeTransparent: legacyColors.makeTransparent,
      makeSolid: legacyColors.makeSolid,
      setAlpha: legacyColors.setAlpha,
      adjustForLightness: legacyColors.adjustForLightness,
    };

export { modernColors, legacyColors, hasModernColorSupport };
