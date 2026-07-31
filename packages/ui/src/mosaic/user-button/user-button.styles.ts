import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

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

  // The workspace list scrolls; the header and footer stay put.
  scroll: {
    maxHeight: '18rem',
    overflowY: 'auto',
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
