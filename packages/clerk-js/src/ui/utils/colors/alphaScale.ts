import type { ColorScale, CssColorOrScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { COLOR_SCALE, getColorMixAlpha } from './utils';

export const generateAlphaScale = (
  color: string | ColorScale<string> | CssColorOrScale | undefined,
): ColorScale<string> => {
  const output: ColorScale<string | undefined> = {
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
  };

  if (!color) {
    return output as ColorScale<string>;
  }
  if (typeof color !== 'string') {
    return color as ColorScale<string>;
  }

  if (cssSupports.colorMix()) {
    COLOR_SCALE.forEach(shade => {
      output[shade] = getColorMixAlpha(color, shade);
    });

    return output as ColorScale<string>;
  }

  return output as ColorScale<string>;
};
