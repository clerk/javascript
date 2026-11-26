import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const tagStyles = stylex.create({
  surface: {
    borderRadius: radiusVars['--cl-radius-sm'],
    paddingInline: space['1'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
    color: colorVars['--cl-color-foreground'],
    display: 'inline-flex',
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['6'],
    maxWidth: '100%',
    minWidth: 0,
  },
  label: {
    overflow: 'hidden',
    paddingInline: space['1'],
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  action: {
    padding: 0,
    borderRadius: radiusVars['--cl-radius-sm'],
    borderStyle: 'none',
    borderWidth: 0,
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':enabled:active': colorVars['--cl-color-neutral-alpha-300'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"], :active)':
          colorVars['--cl-color-neutral-alpha-200'],
      },
    },
    color: 'inherit',
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':enabled:active': durationVars['--cl-duration-instant'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': durationVars['--cl-duration-instant'],
      },
    },
    transitionProperty: 'background-color',
    transitionTimingFunction: 'linear',
    height: space['4'],
    width: space['4'],
  },
});
