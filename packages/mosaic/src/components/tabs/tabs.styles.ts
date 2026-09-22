import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, fontFamilyVars, space, typeScaleVars } from '../../tokens.stylex';

const reduceMotion = '@media (prefers-reduced-motion: reduce)' as const;

export const styles = stylex.create({
  root: {
    gap: space['6'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  list: {
    gap: space['5'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    position: 'relative',
    borderBottomColor: colorVars['--cl-color-border-subtle'],
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  tab: {
    borderStyle: 'none',
    gap: space['2'],
    alignItems: 'center',
    backgroundColor: 'transparent',
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([data-selected])': colorVars['--cl-color-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not([data-selected]):not([data-disabled])': colorVars['--cl-color-foreground'],
      },
    },
    cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
    display: 'inline-flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    paddingBottom: space['3'],
    paddingTop: space['2.5'],
  },
  panels: {
    display: 'grid',
  },
  panel: {
    gridColumnEnd: '2',
    gridColumnStart: '1',
    gridRowEnd: '2',
    gridRowStart: '1',
  },
  indicator: {
    backgroundColor: colorVars['--cl-color-foreground'],
    pointerEvents: 'none',
    position: 'absolute',
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      [reduceMotion]: durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'left, width',
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    bottom: '-1px',
    height: '2px',
  },
});
