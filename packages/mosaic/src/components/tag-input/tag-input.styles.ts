import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  radiusVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    '--cl-layout-duration': durationVars['--cl-duration-base'],
    '--cl-layout-easing': easingVars['--cl-ease-enter'],
    padding: space['2'],
    borderRadius: radiusVars['--cl-radius-md'],
    gap: space['2'],
    alignContent: 'flex-start',
    alignItems: 'center',
    cursor: 'text',
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    position: 'relative',
    minHeight: space['20'],
    width: '100%',
  },
  disabled: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 5%, transparent)`,
    cursor: 'not-allowed',
  },
  list: {
    display: 'contents',
  },
  tag: {
    cursor: 'default',
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.9)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
  },
  tagInvalid: {
    backgroundColor: colorVars['--cl-color-negative-subtle'],
    color: colorVars['--cl-color-negative'],
  },
  input: {
    borderStyle: 'none',
    borderWidth: 0,
    outline: 'none',
    paddingBlock: 0,
    paddingInline: space['1'],
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-foreground'],
    cursor: { default: null, ':disabled': 'not-allowed', ':read-only': 'not-allowed' },
    flexBasis: '8ch',
    flexGrow: 1,
    fontFamily: 'inherit',
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['6'],
    minWidth: 0,
    '::placeholder': {
      color: colorVars['--cl-color-input-placeholder'],
    },
  },
});
