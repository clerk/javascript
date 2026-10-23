import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  icon: { display: 'block', objectFit: 'contain', height: space['5'], width: space['5'] },
  maskedIcon: {
    backgroundColor: 'currentColor',
    display: 'block',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
    height: space['5'],
    width: space['5'],
  },
  appleOffset: {
    translate: '0 -1px',
  },
  maskImage: (url: string) => ({ maskImage: `url(${JSON.stringify(url)})` }),
  fallback: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    color: colorVars['--cl-color-neutral'],
    display: 'inline-flex',
    fontSize: '0.625rem',
    justifyContent: 'center',
    height: space['5'],
    width: space['5'],
  },
});
