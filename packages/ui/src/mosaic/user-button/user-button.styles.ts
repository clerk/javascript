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

  // A labelled trigger is a pill around the avatar and its text, so it pads and rounds itself
  // instead of tracing the avatar.
  triggerLabelled: {
    borderRadius: radiusVars['--cl-radius-full'],
    gap: space['2'],
    paddingBlock: space['1'],
    alignItems: 'center',
    paddingInlineEnd: space['2'],
    paddingInlineStart: space['1'],
  },

  // Matches `Item.Title`, so the trigger names a workspace the same way its row does. Capped,
  // because the trigger sits in a host app's chrome and a long workspace name would push it apart.
  triggerName: {
    color: colorVars['--cl-color-neutral'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    maxWidth: '12rem',
  },

  // The workspace list scrolls; the header and footer stay put.
  scroll: {
    maxHeight: '18rem',
    overflowY: 'auto',
  },

  // The trailing column is as wide as the `⋯` menu button that owns it, so whatever stands in
  // that button's place — the active check, a spinner — lands on the same centre line and the
  // right edge of every row holds still as rows change state.
  trailing: {
    justifyContent: 'center',
    width: space['7'],
  },

  branding: {
    gap: space['2'],
    paddingBlock: space['3'],
    alignItems: 'center',
    borderBlockStartColor: colorVars['--cl-color-border-faded'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    color: colorVars['--cl-color-neutral-faded'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    justifyContent: 'center',
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    textAlign: 'center',
  },
});

// The focus ring traces the avatar, so the trigger takes the avatar's radius. Rounding it
// fully draws a circle around a square workspace mark.
export const triggerShapes = stylex.create({
  circle: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: radiusVars['--cl-radius-md'] },
});
