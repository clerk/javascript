import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  // The avatar is the trigger, so the button paints nothing of its own.
  trigger: {
    padding: 0,
    borderStyle: 'none',
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    outlineOffset: '2px',
  },

  // A labelled trigger sits in a host app's chrome, so it stays flush like the avatar-only form
  // and only spaces the avatar from its text.
  triggerLabelled: {
    gap: space['2'],
    alignItems: 'center',
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

  // The workspace list scrolls; the header and footer stay put. The scroll area carries the
  // overflow, the edge fades, the scrollbar and the scroll padding they need, so only the cap
  // is ours.
  scroll: {
    maxHeight: '18rem',
  },

  // A menu item lays its children out in one flat row, so the account's identifier is what has to
  // take the space between its avatar and the check rather than the menu spacing the three evenly.
  accountName: {
    flexGrow: 1,
    minWidth: 0,
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
  square: { borderRadius: radiusVars['--cl-radius-md'] },
});
