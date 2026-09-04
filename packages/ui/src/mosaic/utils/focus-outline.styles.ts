import * as stylex from '@stylexjs/stylex';

import { colorVars, focusVars } from '../tokens.stylex';

// The keyboard focus ring, in one place. Every focusable Mosaic surface drew the same
// `2px solid --cl-color-primary` inline, so the ring was a dozen copies of one decision
// with nothing keeping them in step — the offsets had already drifted.
//
// Values come from tokens (`--cl-focus-outline-*` and `--cl-color-ring`), which is how a
// theme restyles the ring: one override reaches every component at once. The
// `:focus-visible` condition is NOT themeable and stays here, so a theme can change what
// the ring looks like but cannot show it to pointer users.
//
// Written as LONGHANDS, not the `outline` shorthand: StyleX ranks a longhand above a
// shorthand regardless of argument order, so these survive a component or consumer style
// that carries `outline: 'none'`, and a component can re-colour its ring without
// restating the width and style.
//
// `Input` is the deliberate exception — it marks focus with a border and box-shadow
// rather than a ring, and keeps an outline only under `forced-colors`.
export const focusOutline = stylex.create({
  // The element's own keyboard focus.
  visible: {
    outlineColor: { default: null, ':focus-visible': colorVars['--cl-color-ring'] },
    outlineOffset: { default: null, ':focus-visible': focusVars['--cl-focus-outline-offset'] },
    outlineStyle: { default: null, ':focus-visible': focusVars['--cl-focus-outline-style'] },
    outlineWidth: { default: null, ':focus-visible': focusVars['--cl-focus-outline-width'] },
  },

  // A container that rings when a child takes keyboard focus. `:has(:focus-visible)`, not
  // `:focus-within` — the latter matches a mouse click too, so the ring would flash on press.
  within: {
    outlineColor: { default: null, ':has(:focus-visible)': colorVars['--cl-color-ring'] },
    outlineOffset: { default: null, ':has(:focus-visible)': focusVars['--cl-focus-outline-offset'] },
    outlineStyle: { default: null, ':has(:focus-visible)': focusVars['--cl-focus-outline-style'] },
    outlineWidth: { default: null, ':has(:focus-visible)': focusVars['--cl-focus-outline-width'] },
  },
});
