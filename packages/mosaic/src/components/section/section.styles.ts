import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, sectionVars, space, typeScaleVars } from '../../tokens.stylex';
import { sectionNestedItemMarker } from './section.markers.stylex';

export const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['3'],
    width: '100%',
  },
  title: {
    color: colorVars['--cl-color-foreground'],
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['3'],
    width: '100%',
  },
  surface: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    width: '100%',
  },
  row: {
    marginInline: space['4'],
    paddingBlock: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '1px',
      ':first-child': '0px',
    },
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['2'],
    minHeight: sectionVars['--cl-section-row-min-height'],
    width: 'auto',
  },
  header: {
    marginInline: space['4'],
    paddingBlock: space['3'],
    borderBlockEndColor: colorVars['--cl-color-border'],
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: '1px',
    width: 'auto',
  },
  items: {
    paddingInline: space['4'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  item: {
    alignItems: 'center',
    columnGap: space['3'],
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  nestedItem: {
    paddingBlock: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '0px',
      [stylex.when.siblingBefore(':where(*)', sectionNestedItemMarker)]: '1px',
    },
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
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  description: {
    color: colorVars['--cl-color-foreground-secondary'],
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
  // Sits under the row's item rather than inside its content, so a message never shifts the
  // media and actions off the center line they share.
  error: {
    width: '100%',
  },
});
