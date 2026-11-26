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
import { cardContentMarker, cardFooterMarker, cardLeadMarker } from './card.markers.stylex';

const compactCard = '@container card (max-width: 20rem)' as const;
const sheet = '@media (width < 40rem)';

const narrowCard = '@container card (max-width: 24rem)' as const;

const top = 'var(--_cl-card-top)';
const headerRowGap = 'var(--_cl-card-header-gap)';
const insetInline = {
  default: 'var(--_cl-card-inset)',
  [narrowCard]: `var(--_cl-card-inset-narrow, ${space['5']})`,
};

export const root = stylex.create({
  base: {
    '--_cl-card-footer-border': '0px',
    '--_cl-card-header-start': {
      default: 'initial',
      // eslint-disable-next-line @stylexjs/no-lookahead-selectors -- every browser this package builds for supports `:has()`; an older one keeps the header's own top padding under a lead.
      [stylex.when.descendant(':where(*)', cardLeadMarker)]: `var(--_cl-card-lead-gap, ${space['5']})`,
    },
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
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
    backgroundColor: colorVars['--cl-color-surface'],
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
    backgroundColor: colorVars['--cl-color-surface'],
    boxShadow: shadowVars['--cl-shadow-lg'],
  },
});

// The outermost card takes what the box around it publishes: a sheet's popup paints the shape and
// has the card only fill it. `minWidth` rather than `width`, so it beats the size's fixed width.
export const surface = stylex.create({
  root: {
    boxShadow: `var(--_cl-surface-shadow, ${shadowVars['--cl-shadow-lg']})`,
    minWidth: 'var(--_cl-surface-min-width, auto)',
  },
});

// A fixed `width` capped by `max-width`, not the reverse, so a parent that sizes to its content
// (a dialog popup) takes the card's full width rather than the width of its text.
export const placement = stylex.create({
  inDialog: {
    '--_cl-card-footer-border': {
      default: '0px',
      // eslint-disable-next-line @stylexjs/no-lookahead-selectors -- every browser this package builds for supports `:has()`; an older one draws no footer divider.
      [stylex.when.descendant(':where(*)', cardContentMarker)]: '1px',
    },
  },
});

// A flush card sits on the page, so its content runs to its edges. Applied after the variant, which
// sets the same insets.
export const flushInsets = stylex.create({
  root: {
    '--_cl-card-content-end': '0px',
    '--_cl-card-footer-end': '0px',
    '--_cl-card-inset': '0px',
    '--_cl-card-inset-narrow': '0px',
    '--_cl-card-top': '0px',
  },
});

export const sizes = stylex.create({
  md: { width: '26.25rem' },
  lg: { width: '36.25rem' },
});

export const variants = stylex.create({
  default: {
    '--_cl-card-content-end': 'initial',
    '--_cl-card-content-footer-gap': 'initial',
    '--_cl-card-content-gap': space['4'],
    '--_cl-card-content-start': space['4'],
    '--_cl-card-footer-end': space['4'],
    '--_cl-card-header-end': '0px',
    '--_cl-card-header-gap': space['0.5'],
    '--_cl-card-inset': space['5'],
    '--_cl-card-title-leading': typeScaleVars['--cl-text-base-leading'],
    '--_cl-card-title-size': typeScaleVars['--cl-text-base-size'],
    '--_cl-card-top': space['4'],
  },
  prominent: {
    '--_cl-card-content-end': space['6'],
    '--_cl-card-content-footer-gap': space['2'],
    '--_cl-card-content-gap': space['6'],
    '--_cl-card-content-start': space['6'],
    '--_cl-card-footer-border': '0px',
    '--_cl-card-footer-end': space['6'],
    '--_cl-card-header-end': space['8'],
    '--_cl-card-header-gap': space['1'],
    '--_cl-card-inset': space['8'],
    '--_cl-card-lead-gap': space['6'],
    '--_cl-card-title-leading': typeScaleVars['--cl-text-xl-leading'],
    '--_cl-card-title-size': typeScaleVars['--cl-text-xl-size'],
    '--_cl-card-top': space['8'],
  },
});

const HEADER_COLUMN_GAP = space['4'];
const CLOSE_BUTTON_WIDTH = space['7'];

export const header = stylex.create({
  // `row-reverse` so the dismiss button leads in the DOM — and so takes the dialog's opening
  // focus — while sitting at the inline end.
  base: {
    paddingInline: insetInline,
    columnGap: HEADER_COLUMN_GAP,
    display: 'flex',
    flexDirection: 'row-reverse',
    paddingBlockEnd: {
      default: 'var(--_cl-card-header-end)',
      // eslint-disable-next-line @stylexjs/no-lookahead-selectors -- every browser this package builds for supports `:has()`; an older one pads a header that has content after it.
      [stylex.when.siblingAfter(':where(*)', cardContentMarker)]: '0px',
      // eslint-disable-next-line @stylexjs/no-lookahead-selectors -- every browser this package builds for supports `:has()`; an older one pads a header that has a footer after it.
      [stylex.when.siblingAfter(':where(*)', cardFooterMarker)]: '0px',
    },
    paddingBlockStart: `var(--_cl-card-header-start, ${top})`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    rowGap: headerRowGap,
    minWidth: 0,
  },
  contentBesideCloseButton: {
    paddingInlineStart: `calc(${CLOSE_BUTTON_WIDTH} + ${HEADER_COLUMN_GAP})`,
  },
  media: {
    display: 'flex',
    marginBlockEnd: `calc(${space['6']} - ${headerRowGap})`,
  },
  title: {
    color: colorVars['--cl-color-foreground'],
    fontSize: 'var(--_cl-card-title-size)',
    fontWeight: fontWeightVars['--cl-font-semibold'],
    lineHeight: 'var(--_cl-card-title-leading)',
    textWrap: 'balance',
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'pretty',
  },
});

export const headerAlign = stylex.create({
  start: {},
  center: {
    textAlign: 'center',
  },
});

export const lead = stylex.create({
  base: {
    paddingInline: insetInline,
    display: 'flex',
    paddingBlockStart: top,
  },
});

export const mediaAlign = stylex.create({
  start: {},
  center: {
    justifyContent: 'center',
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
    marginInline: insetInline,
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
    gap: 'var(--_cl-card-content-gap)',
    paddingInline: insetInline,
    display: 'grid',
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    paddingBlockEnd: {
      default: `var(--_cl-card-content-end, ${space['5']})`,
      // eslint-disable-next-line @stylexjs/no-lookahead-selectors -- every browser this package builds for supports `:has()`; an older one keeps the footerless padding.
      [stylex.when.siblingAfter(':where(*)', cardFooterMarker)]: `var(--_cl-card-content-footer-gap, ${space['4']})`,
    },
    paddingBlockStart: 'var(--_cl-card-content-start)',
  },
});

export const footer = stylex.create({
  base: {
    gap: space['2'],
    paddingInline: insetInline,
    alignItems: 'center',
    display: { [compactCard]: 'grid', default: 'flex' },
    flexDirection: 'row',
    flexShrink: 0,
    gridTemplateColumns: { [compactCard]: 'minmax(0, 1fr)', default: null },
    justifyContent: 'space-between',
    paddingBlockEnd: 'var(--_cl-card-footer-end)',
    paddingBlockStart: space['4'],
    borderTopColor: colorVars['--cl-color-border-subtle'],
    borderTopStyle: 'solid',
    borderTopWidth: 'var(--_cl-card-footer-border)',
    width: '100%',
  },
});

export const footerActions = stylex.create({
  end: {
    justifyContent: 'flex-end',
  },
  fill: {},
  fillInDialog: {
    alignItems: { default: null, [sheet]: 'stretch' },
    flexDirection: { default: null, [sheet]: 'column-reverse' },
  },
  stacked: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
  },
});

export const branding = stylex.create({
  // Placement only; the mark itself is `Branding`.
  base: {
    paddingBlock: space['3'],
    paddingInline: space['6'],
    borderBlockStartColor: colorVars['--cl-color-border-subtle'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    display: 'flex',
    justifyContent: 'center',
  },
  flush: {
    paddingInline: 0,
    borderBlockStartWidth: 0,
    paddingBlockStart: space['10'],
  },
});
