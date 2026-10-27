import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, fontWeightVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  skeletonFill: { width: '100%' },
  organizationAccess: { gap: space['3'], display: 'flex', flexDirection: 'column' },
  organizationPicker: {
    display: 'grid',
    gridTemplateRows: {
      default: '1fr',
      ':where(:not([data-open]), [data-starting-style])': '0fr',
    },
    marginBlockStart: `calc(${space['3']} * -1)`,
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'grid-template-rows',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-in-out'],
    },
  },
  organizationPickerClip: { overflow: 'clip', minHeight: 0 },
  organizationPickerTrigger: { inlineSize: '100%', marginBlockStart: space['3'] },
  organizationAccessLabel: { fontWeight: fontWeightVars['--cl-font-medium'] },
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
  scopeList: { listStyleType: 'none', maxBlockSize: '20rem' },
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
