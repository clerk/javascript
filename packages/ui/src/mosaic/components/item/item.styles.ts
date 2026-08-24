import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const item = stylex.create({
  base: {
    // The icon in `Item.Media` rides the row's text strength rather than its own, the way
    // `Button` does it. `Icon` reads the var (`icon.styles.ts`) — StyleX can't emit a descendant
    // rule, so the value crosses the element boundary as a custom property. It is restated in
    // `interactive` rather than gaining a hover branch here: StyleX resolves a property to the
    // last style that declares it, so the two can't merge.
    '--_cl-icon-color': colorVars['--cl-color-neutral-faded'],
    borderRadius: radiusVars['--cl-radius-lg'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    paddingInline: space['1.5'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: 'flex',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    outlineOffset: '2px',
    textAlign: 'start',
    width: '100%',
  },

  // interactive rows (rendered as a link/button via `render`) gain hover + cursor. Only these
  // promote on hover: a static row is not pointing at anything, so its icon and label hold.
  // A row that is standing down while another action runs keeps its look rather than dimming, so
  // it holds its opacity where `Button` drops to 0.5. The pointer still reaches it, which is what
  // shows `not-allowed`, so every hover branch has to exclude a standing-down row itself. Both
  // spellings count: a row that has to stay focusable while it waits carries `aria-disabled`
  // instead of the native attribute.
  interactive: {
    '--_cl-icon-color': {
      default: colorVars['--cl-color-neutral-faded'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-neutral'],
      },
    },
    backgroundColor: {
      default: null,
      ':active:not(:disabled, [aria-disabled="true"])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [aria-disabled="true"])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    color: {
      default: colorVars['--cl-color-neutral-faded'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [aria-disabled="true"])': colorVars['--cl-color-neutral'],
      },
    },
    cursor: {
      default: 'pointer',
      ':is(:disabled, [aria-disabled="true"])': 'not-allowed',
    },
  },

  xs: {
    gap: space['2'],
    height: space['9'],
  },
  md: {
    gap: space['3'],
    height: space['13'],
  },
});

export const media = stylex.create({
  base: {
    alignItems: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
  },

  xs: { width: space['6'] },
  md: { width: space['9'] },
});

export const content = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
});

export const label = stylex.create({
  base: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },

  primary: {
    color: colorVars['--cl-color-neutral'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  // Declares no color, so `reset`'s `inherit` stands and the row's own color reaches it. That is
  // what carries it through the hover promotion on an interactive row, which a fixed color would
  // freeze. It has to stay undeclared here rather than restated: StyleX resolves a property to the
  // last style that declares it, so `base` cannot hold a color either.
  secondary: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});

export const description = stylex.create({
  base: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});

export const actions = stylex.create({
  base: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
  },
});

export const group = stylex.create({
  base: {
    padding: space['2'],
    width: '100%',
  },
});

export const separator = stylex.create({
  base: {
    borderStyle: 'none',
    backgroundColor: colorVars['--cl-color-border-faded'],
    flexShrink: 0,
    height: '1px',
    width: '100%',
  },
});
