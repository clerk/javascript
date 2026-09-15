import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  connectRow: { justifyContent: 'center' },
  icon: { display: 'block', objectFit: 'contain', height: space['6'], width: space['6'] },
  fallback: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
    color: colorVars['--cl-color-neutral'],
    display: 'inline-flex',
    fontSize: '0.625rem',
    justifyContent: 'center',
    height: space['6'],
    width: space['6'],
  },
  label: { gap: space['2'], alignItems: 'center', display: 'flex', flexWrap: 'wrap' },
  text: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
});
