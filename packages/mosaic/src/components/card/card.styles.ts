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
import { cardContentMarker } from './card.markers.stylex';

const compactCard = '@container card (max-width: 20rem)' as const;

export const root = stylex.create({
  base: {
    color: colorVars['--cl-color-foreground'],
    containerName: 'card',
    containerType: 'inline-size',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
  },
  card: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-lg'],
  },
  flush: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'visible',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  overlay: {
    borderRadius: radiusVars['--cl-radius-xl'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-lg'],
  },
});

// A fixed `width` capped by `max-width`, not the reverse, so a parent that sizes to its content
// (a dialog popup) takes the card's full width rather than the width of its text.
export const sizes = stylex.create({
  md: { width: '26.25rem' },
  lg: { width: '36.25rem' },
});

export const header = stylex.create({
  // `row-reverse` so the dismiss button leads in the DOM — and so takes the dialog's opening
  // focus — while sitting at the inline end.
  base: {
    paddingInline: space['5'],
    columnGap: space['1'],
    display: 'flex',
    flexDirection: 'row-reverse',
    paddingBlockStart: space['4'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    rowGap: space['0.5'],
  },
  title: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    fontWeight: fontWeightVars['--cl-font-semibold'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
    textWrap: 'balance',
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'pretty',
  },
});

const INSET = space['4'];

export const banner = stylex.create({
  // A root flex item, not a content grid item: a grid track floors at 0 whatever the margin, so the gap would stay.
  collapse: {
    display: 'grid',
    gridTemplateRows: {
      default: '1fr',
      ':where(:not([data-open]), [data-starting-style])': '0fr',
    },
    maskImage: `linear-gradient(to bottom, transparent, black ${INSET})`,
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
  // No padding (it is the 0fr track's minimum); the span sizes the item to the wrapper, not the re-resolved track.
  clip: {
    overflow: 'clip',
    alignContent: 'end',
    display: 'grid',
    gridRowEnd: 'span 2',
    gridRowStart: '1',
    minHeight: 0,
  },
  surface: {
    marginInline: space['5'],
    marginBlockStart: INSET,
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.96)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    transformOrigin: 'top',
    transitionDelay: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-instant'],
      '@media (prefers-reduced-motion: reduce)': durationVars['--cl-duration-instant'],
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
});

export const content = stylex.create({
  // A grid rather than a flex column: grid ignores a child's `flex`, so a `fullWidth` button
  // keeps its height instead of collapsing to a zero basis on the block axis.
  base: {
    gap: space['4'],
    paddingBlock: space['4'],
    paddingInline: space['5'],
    display: 'grid',
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
});

export const footer = stylex.create({
  base: {
    gap: space['2'],
    paddingBlock: space['4'],
    paddingInline: space['5'],
    alignItems: 'center',
    display: { [compactCard]: 'grid', default: 'flex' },
    flexDirection: 'row',
    flexShrink: 0,
    gridTemplateColumns: { [compactCard]: 'minmax(0, 1fr)', default: null },
    justifyContent: 'space-between',
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: {
      default: '0px',
      [stylex.when.siblingBefore(':where(*)', cardContentMarker)]: '1px',
    },
    width: '100%',
  },
});

export const branding = stylex.create({
  // Placement only; the mark itself is `Branding`.
  base: {
    paddingBlock: space['3'],
    paddingInline: space['6'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    textAlign: 'center',
  },
});
