import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  countdown: {
    fontVariantNumeric: 'tabular-nums',
  },
  contactValue: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  providerIcon: {
    display: 'block',
    objectFit: 'contain',
    height: space['5'],
    width: space['5'],
  },
  providerInitial: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    color: colorVars['--cl-color-neutral'],
    display: 'inline-flex',
    fontSize: '0.625rem',
    justifyContent: 'center',
  },
});
