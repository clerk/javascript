import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  shell: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    containerType: 'inline-size',
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  viewport: {
    overscrollBehaviorX: 'none',
  },
  // The viewport without the scroll-area's edge fade: it still scrolls horizontally when the
  // columns overflow, but shows no left/right gradient. For a table whose columns are meant to fit.
  plainViewport: {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
  },
  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
    textAlign: 'start',
    width: '100%',
  },
  header: {
    backgroundColor: colorVars['--cl-color-border-subtle'],
  },
  bodyRow: {
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
  },
  selectedRow: {
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
  },
  headerCell: {
    paddingBlock: space['2.5'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  sortableHeaderCell: {
    paddingBlock: space['1.5'],
    paddingInline: space['2'],
  },
  sortButton: {
    color: 'inherit',
    fontWeight: 'inherit',
  },
  cell: {
    paddingBlock: space['3'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    verticalAlign: 'middle',
  },
  selectCell: {
    lineHeight: 0,
    paddingInlineEnd: 0,
    paddingInlineStart: space['4'],
    verticalAlign: 'middle',
    width: 0,
  },
  emptyCell: {
    textAlign: 'center',
  },
});

export const aligns = stylex.create({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' },
});
