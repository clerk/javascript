import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';
import { itemScope } from './item.markers.stylex';

export const item = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-lg'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
    },
    paddingInline: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: 'flex',
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
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    cursor: 'pointer',
  },

  xs: {
    gap: space['2'],
    height: space['8'],
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

  xs: { width: space['5'] },
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

export const title = stylex.create({
  base: {
    color: colorVars['--cl-color-neutral'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
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

export const label = stylex.create({
  base: {
    // keyed to the row's hover, not the text's, so pointing anywhere in the row promotes the label
    color: {
      default: null,
      [stylex.when.ancestor(':not(:hover)', itemScope)]: colorVars['--cl-color-neutral-faded'],
      [stylex.when.ancestor(':hover', itemScope)]: colorVars['--cl-color-neutral'],
    },
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
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
