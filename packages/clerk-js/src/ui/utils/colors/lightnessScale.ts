import type { ColorScale, CssColorOrScale } from '@clerk/types';

import { cssSupports } from '../cssSupports';
import { COLOR_SCALE, getColorMixSyntax, getRelativeColorSyntax } from './utils';

export const generateLightnessScale = (color: CssColorOrScale | undefined): ColorScale<string | undefined> => {
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
    return output;
  }

  if (typeof color !== 'string') {
    return { ...output, ...color };
  }

  if (cssSupports.relativeColorSyntax()) {
    COLOR_SCALE.forEach(shade => {
      output[shade] = getRelativeColorSyntax(color, shade);
    });

    return output;
  }

  if (cssSupports.colorMix()) {
    COLOR_SCALE.forEach(shade => {
      output[shade] = getColorMixSyntax(color, shade);
    });

    return output;
  }

  return output;
};
