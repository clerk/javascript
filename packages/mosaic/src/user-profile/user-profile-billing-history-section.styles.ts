import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export const styles = stylex.create({
  actionCell: {
    textAlign: 'end',
  },
  amountCell: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  cell: {
    paddingBlock: space['3'],
    paddingInline: space['4'],
    verticalAlign: 'middle',
  },
  emptyCell: {
    paddingBlock: space['6'],
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
  invoiceColumn: {
    width: '34%',
  },
  invoiceId: {
    overflow: 'hidden',
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    marginBlockStart: space['0.5'],
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  invoiceLabel: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
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
    gap: space['2'],
    paddingBlock: space['2'],
    paddingInline: space['3'],
    alignItems: 'center',
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  paginationControls: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
  },
  row: {
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
  },
  shell: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    width: '100%',
  },
  statusColumn: {
    width: '20%',
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
  viewColumn: {
    width: '14%',
  },
});
