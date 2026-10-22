import * as stylex from '@stylexjs/stylex';

export const rtl = stylex.create({
  mirror: {
    transform: { default: null, ':is([dir="rtl"] *)': 'scaleX(-1)' },
  },
});
