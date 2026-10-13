import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  scopes: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
  },
  scopesTitle: {
    paddingBlock: space['2'],
    paddingInline: space['3'],
    backgroundColor: colorVars['--cl-color-background-subtle'],
    borderBlockEndColor: colorVars['--cl-color-border'],
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: '1px',
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  scopeList: { listStyleType: 'none' },
  scopeRow: {
    paddingBlock: space['2'],
    paddingInline: space['3'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: { default: 0, ':not(:first-child)': '1px' },
  },
  scopeText: { gap: space['0.5'], display: 'flex', flexDirection: 'column' },
  scopeLabel: { gap: space['2'], alignItems: 'center', display: 'flex' },
  centered: { justifyContent: 'center', textAlign: 'center' },
  actions: { gap: space['3'], display: 'flex' },
  inlineLink: { fontSize: 'inherit', lineHeight: 'inherit', verticalAlign: 'baseline' },
  nowrap: { whiteSpace: 'nowrap' },
});
