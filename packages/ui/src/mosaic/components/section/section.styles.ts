import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';
import { sectionItemsMarker } from './section.markers.stylex';

/* eslint-disable @stylexjs/no-lookahead-selectors -- Mosaic's supported browsers include :has();
   the marker keeps this selector scoped to Section.Items. */
export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['3'],
    width: '100%',
  },
  title: {
    color: colorVars['--cl-color-neutral'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  group: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    width: '100%',
  },
  row: {
    marginInline: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '1px',
      ':first-child': '0px',
    },
    display: 'flex',
    flexDirection: 'column',
    paddingBlockEnd: {
      default: space['4'],
      [stylex.when.descendant(':where(*)', sectionItemsMarker)]: 0,
    },
    paddingBlockStart: {
      default: space['4'],
      [stylex.when.descendant(':where(*)', sectionItemsMarker)]: space['3'],
    },
    rowGap: {
      default: space['2'],
      [stylex.when.descendant(':where(*)', sectionItemsMarker)]: 0,
    },
    minHeight: {
      default: `calc(${space['18.5']} + 1px)`,
      [stylex.when.descendant(':where(*)', sectionItemsMarker)]: 0,
    },
    width: 'auto',
  },
  items: {
    backgroundColor: colorVars['--cl-color-border'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    marginBlockStart: space['3'],
    rowGap: '1px',
    width: '100%',
  },
  item: {
    paddingBlock: {
      default: null,
      [stylex.when.ancestor(':where(*)', sectionItemsMarker)]: space['4'],
    },
    alignItems: 'center',
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':where(*)', sectionItemsMarker)]: colorVars['--cl-color-card'],
    },
    columnGap: space['3'],
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  mediaBase: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  mediaSm: {
    height: space['4'],
    width: space['4'],
  },
  mediaMd: {
    height: space['6'],
    width: space['6'],
  },
  mediaLg: {
    height: space['10'],
    width: space['10'],
  },
  mediaXl: {
    height: space['12'],
    width: space['12'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    rowGap: space['0.5'],
    minWidth: 0,
  },
  label: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'balance',
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'flex-end',
  },
});
/* eslint-enable @stylexjs/no-lookahead-selectors */
