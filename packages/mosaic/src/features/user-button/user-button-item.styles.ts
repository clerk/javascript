import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    // The icon in the media column rides the row's text strength rather than its own, the way
    // `Button` does it. `Icon` reads the var (`icon.styles.ts`) — StyleX can't emit a descendant
    // rule, so the value crosses the element boundary as a custom property. It is restated in
    // `interactive` rather than gaining a hover branch here: StyleX resolves a property to the
    // last style that declares it, so the two can't merge.
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    borderRadius: radiusVars['--cl-radius-lg'],
    gap: space['1.5'],
    paddingInline: space['1.5'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textAlign: 'start',
    height: space['8'],
    width: '100%',
  },

  // A row rendered as a link or button gains hover and cursor. A row standing down while another
  // action runs keeps its look rather than dimming, but the pointer still reaches it to show
  // `not-allowed`, so every hover branch excludes it. Both spellings count: a row that has to stay
  // focusable while it waits carries `aria-disabled` instead of the native attribute.
  interactive: {
    '--_cl-icon-color': {
      default: colorVars['--cl-color-foreground-secondary'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-foreground'],
      },
    },
    backgroundColor: {
      default: null,
      ':active:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-neutral-alpha-200'],
      '@media (hover: hover)': {
        ':hover:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-neutral-alpha-100'],
      },
    },
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-foreground'],
      },
    },
    cursor: {
      default: 'pointer',
      ':is(:disabled, [aria-disabled="true"])': 'not-allowed',
    },
  },

  media: {
    alignItems: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: space['5'],
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 0,
  },

  label: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },

  labelDefault: {
    color: colorVars['--cl-color-foreground'],
  },

  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },

  // At least as wide as the `⋯` menu button that owns it, so whatever stands in that button's
  // place — the active check, a spinner — lands on the same center line and the right edge of every
  // row holds still as rows change state. A labelled button or a note grows it past that.
  trailing: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    minWidth: space['7'],
  },

  group: {
    padding: space['1.5'],
    width: '100%',
  },

  separator: {
    borderStyle: 'none',
    backgroundColor: colorVars['--cl-color-border-subtle'],
    flexShrink: 0,
    height: '1px',
    width: '100%',
  },
});
