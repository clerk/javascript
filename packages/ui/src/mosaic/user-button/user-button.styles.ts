import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  trigger: {
    padding: space['1'],
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-open])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    cursor: 'pointer',
    display: 'inline-flex',
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'background-color',
  },

  triggerLabelled: {
    gap: space['1.5'],
  },

  // Matches `Item.Label`, so the trigger names a workspace the same way its row does. Capped,
  // because the trigger sits in a host app's chrome and a long workspace name would push it apart.
  triggerName: {
    color: colorVars['--cl-color-neutral'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    maxWidth: '12rem',
  },

  triggerCaret: {
    '--_cl-icon-color': colorVars['--cl-color-neutral-faded'],
  },

  // The workspace list scrolls; the header and footer stay put. The scroll area carries the
  // overflow, the edge fades, the scrollbar and the scroll padding they need, so only the cap
  // is ours.
  scroll: {
    maxHeight: '18rem',
  },

  // The trailing column is as wide as the `⋯` menu button that owns it, so whatever stands in
  // that button's place — the active check, a spinner — lands on the same centre line and the
  // right edge of every row holds still as rows change state.
  trailing: {
    justifyContent: 'center',
    width: space['7'],
  },
});

// The trigger takes the corner of the workspace mark it carries: round for a person, squared for
// an organization. Rounding it fully would draw a circle around a square mark, labelled or not.
export const triggerShapes = stylex.create({
  circle: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: `calc(${radiusVars['--cl-radius-md']} + ${space['1']})` },
});
