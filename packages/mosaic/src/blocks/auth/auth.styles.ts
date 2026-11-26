import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  centered: {
    textAlign: 'center',
  },
  captcha: {
    justifySelf: 'center',
  },
  fieldStack: {
    gap: space['4'],
    display: 'grid',
  },
  footerText: {
    textAlign: 'center',
  },
  identity: {
    display: 'flex',
    justifyContent: 'center',
    marginBlockStart: space['2'],
    paddingInlineEnd: space['4'],
    paddingInlineStart: space['4'],
    minWidth: 0,
  },
  identifierText: {
    color: colorVars['--cl-color-foreground'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    overflowWrap: 'anywhere',
    unicodeBidi: 'isolate',
  },
  loading: {
    justifyItems: 'center',
    paddingBlockEnd: space['10'],
    paddingBlockStart: space['10'],
  },
  logo: {
    display: 'block',
    objectFit: 'contain',
    height: space['8'],
    maxWidth: '100%',
  },
  protectCheck: {
    justifyItems: 'center',
  },
  protectCheckContainer: {
    display: 'block',
  },
  protectCheckContainerEmpty: {
    position: 'absolute',
  },
  providerIcon: {
    display: 'block',
    objectFit: 'contain',
    height: space['4'],
    width: space['4'],
  },
  providerMark: {
    backgroundColor: 'currentColor',
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
  },
  providerMarkImage: (image: string) => ({
    maskImage: image,
  }),
  reference: {
    gap: space['0.5'],
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  referenceCopy: {
    flexShrink: 0,
  },
  referenceLabel: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  referenceText: {
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
  },
  referenceValue: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
    maxWidth: '100%',
    minWidth: 0,
  },
  status: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  walletsLoading: {
    display: 'grid',
    justifyItems: 'center',
  },
});
