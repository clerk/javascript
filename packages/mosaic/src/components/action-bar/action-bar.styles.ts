import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const reduceMotion = '@media (prefers-reduced-motion: reduce)';

export const styles = stylex.create({
  positioner: {
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
    bottom: space['2'],
  },
  // Anchored to the nearest positioned ancestor — for a bounded container.
  positionerAbsolute: {
    insetInline: 0,
    position: 'absolute',
  },
  // Pinned to the foot of the nearest scroll container, so it stays in view while its surface
  // scrolls. `margin-block-start: auto` drops it to the bottom when the column has room to spare.
  positionerSticky: {
    marginBlockStart: 'auto',
    position: 'sticky',
  },
  bar: {
    borderRadius: radiusVars['--cl-radius-lg'],
    gap: space['1'],
    paddingBlock: space['1'],
    paddingInline: space['1'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-lg'],
    display: 'flex',
    opacity: {
      default: 1,
      ':is([data-open="false"])': 0,
    },
    pointerEvents: 'auto',
    transform: {
      default: 'translateY(0)',
      ':is([data-open="false"])': 'translateY(0.25rem)',
    },
    transitionDuration: {
      default: `${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      [reduceMotion]: `${durationVars['--cl-duration-instant']}, ${durationVars['--cl-duration-instant']}`,
      ':is([data-open="false"])': `${durationVars['--cl-duration-instant']}, ${durationVars['--cl-duration-instant']}`,
    },
    transitionProperty: 'opacity, transform',
    transitionTimingFunction: {
      default: `linear, ${easingVars['--cl-ease-enter']}`,
    },
    maxWidth: 'calc(100% - 2 * var(--cl-spacing))',
  },
  count: {
    paddingInline: space['2'],
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    whiteSpace: 'nowrap',
  },
  separator: {
    marginBlock: space['1'],
    marginInline: space['0.5'],
    alignSelf: 'stretch',
    backgroundColor: colorVars['--cl-color-border'],
    width: '1px',
  },
});
