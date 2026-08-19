import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  actionCell: {
    textAlign: 'end',
    width: space['12'],
  },
  cell: {
    paddingBlock: space['3'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    verticalAlign: 'middle',
  },
  checkbox: {
    accentColor: colorVars['--cl-color-primary'],
    cursor: 'pointer',
    height: space['4'],
    width: space['4'],
  },
  checkboxCell: {
    paddingInlineEnd: space['1'],
    paddingInlineStart: space['4'],
    textAlign: 'center',
    width: space['8'],
  },
  emptyCell: {
    paddingBlock: space['8'],
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textAlign: 'center',
  },
  header: {
    backgroundColor: colorVars['--cl-color-border-faded'],
  },
  headerCell: {
    paddingBlock: space['2.5'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    textAlign: 'start',
  },
  keyDescription: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    marginBlockStart: space['0.5'],
  },
  keyName: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  nameColumn: {
    width: '38%',
  },
  pageSizeLabel: {
    gap: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  pageSizeSelect: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingBlock: space['1'],
    paddingInline: space['2'],
    backgroundColor: colorVars['--cl-color-card'],
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  pagination: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  paginationControls: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
  },
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  row: {
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
  },
  table: {
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    width: '100%',
  },
  tableScroller: {
    overflowX: 'auto',
    width: '100%',
  },
  tableShell: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    width: '100%',
  },
});
