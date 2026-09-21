import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../../tokens.stylex';

export const styles = stylex.create({
  connectRow: { justifyContent: 'center' },
  fallback: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    color: colorVars['--cl-color-neutral'],
    display: 'inline-flex',
    flexShrink: 0,
    fontSize: '0.625rem',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  label: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  text: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  icon: {
    display: 'block',
    objectFit: 'contain',
    height: space['5'],
    width: space['5'],
  },
});
