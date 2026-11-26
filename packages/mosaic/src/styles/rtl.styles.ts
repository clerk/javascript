import * as stylex from '@stylexjs/stylex';

export const rtl = stylex.create({
  inlineSign: {
    '--_cl-inline-sign': { default: null, ':is([dir="rtl"] *)': '-1' },
  },
  mirror: {
    transform: { default: null, ':is([dir="rtl"] *)': 'scaleX(-1)' },
  },
});
