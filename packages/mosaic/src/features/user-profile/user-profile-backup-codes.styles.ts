import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  codes: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background-subtle'],
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    listStyleType: 'none',
  },
  cell: {
    borderColor: colorVars['--cl-color-border'],
    borderStyle: 'solid',
    paddingBlock: space['2'],
    paddingInline: space['3'],
    alignItems: 'center',
    borderBlockEndWidth: 0,
    borderBlockStartWidth: { default: 0, ':nth-child(n + 3)': '1px' },
    borderInlineEndWidth: { default: 0, ':nth-child(odd)': '1px' },
    borderInlineStartWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: 0,
  },
  code: {
    overflowWrap: 'anywhere',
  },
});
