import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const item = stylex.create({
  base: {
    margin: 0,
    padding: 0,
    borderRadius: radiusVars['--cl-radius-element'],
    gap: space['3'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid color-mix(in oklab, ${colorVars['--cl-color-primary']} 50%, transparent)`,
    },
    paddingInline: space['2'],
    alignItems: 'center',
    boxSizing: 'border-box',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    outlineOffset: '2px',
    textAlign: 'start',
    width: '100%',
  },

  // interactive rows (rendered as a link/button via `render`) gain hover + cursor
  interactive: {
    backgroundColor: {
      default: null,
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`,
      // Hover excludes `:active` explicitly — StyleX doubles the class inside an at-rule, so a
      // `@media (hover: hover)` `:hover` outranks the bare `:active` and wins while pressing.
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:active)': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    cursor: 'pointer',
    // The press reads as contact, not a fade, so it lands instantly; release falls back to `fast`.
    // Bare `:active`, not `:enabled:active` as on `button` — the row renders as a `div` or an `a`,
    // and `:enabled` only ever matches form controls.
    transitionDuration: {
      default: durationVars['--cl-duration-fast'],
      ':active': durationVars['--cl-duration-instant'],
    },
    transitionProperty: 'background-color',
    // Linear, not `--cl-ease-default`: nothing here moves.
    transitionTimingFunction: 'linear',
  },

  // vertical density derived from the variant; horizontal padding is shared by the base
  entity: {
    paddingBlock: space['2'],
  },
  action: {
    paddingBlock: space['2.5'],
  },
});

export const media = stylex.create({
  base: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    width: space['9'],
  },
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

export const title = stylex.create({
  base: {
    // Non-action rows inherit the row's foreground. Only `action` rows start faded and
    // darken to neutral on hover. Both overrides are scoped to the marker that item.tsx
    // sets exclusively on interactive `action` rows, so no other row's title is touched.
    color: {
      default: null,
      [stylex.when.ancestor(':not(:hover)')]: colorVars['--cl-color-neutral-faded'],
      [stylex.when.ancestor(':hover')]: colorVars['--cl-color-neutral'],
    },
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    // Matches the row's background fade so the two settle together. No `:active` branch: the row
    // still matches `:hover` while pressed, so the title's color doesn't change on press.
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'color',
    // Linear, not `--cl-ease-default`: nothing here moves.
    transitionTimingFunction: 'linear',
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

export const header = stylex.create({
  base: {
    paddingInline: space['2'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export const headerTitle = stylex.create({
  base: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
});

export const headerActions = stylex.create({
  base: {
    width: space['7'],
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
