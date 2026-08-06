import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, scrollFadeVars, space, typeScaleVars } from '../tokens.stylex';

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

  // Matches `Item.Title`, so the trigger names a workspace the same way its row does. Capped,
  // because the trigger sits in a host app's chrome and a long workspace name would push it apart.
  triggerName: {
    color: colorVars['--cl-color-neutral'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    maxWidth: '12rem',
  },

  // The workspace list scrolls; the header and footer stay put. The scroll area carries the
  // overflow itself, along with the edge fades and the scrollbar, so only the cap and the scroll
  // padding are ours. The padding answers those fades: tabbing to a row below the fold would
  // otherwise land it flush against the edge the mask fades out, on the one row you just moved to.
  scroll: {
    scrollPaddingBlockEnd: scrollFadeVars['--cl-scroll-fade-size'],
    scrollPaddingBlockStart: scrollFadeVars['--cl-scroll-fade-size'],
    maxHeight: '18rem',
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

// The trigger takes the corner of the workspace mark it carries: round for a person, squared for
// an organization. Rounding it fully would draw a circle around a square mark, labelled or not.
export const triggerShapes = stylex.create({
  circle: { borderRadius: radiusVars['--cl-radius-full'] },
  square: { borderRadius: radiusVars['--cl-radius-md'] },
});
