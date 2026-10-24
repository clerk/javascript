import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, scrollFadeVars, space, typeScaleVars } from '../../tokens.stylex';

const surface = 'var(--_cl-table-surface)';
const tint = 'var(--_cl-table-row-tint)';

const fadeRight = `linear-gradient(to right, ${tint}, transparent), linear-gradient(to right, ${surface}, transparent)`;
const fadeLeft = `linear-gradient(to left, ${tint}, transparent), linear-gradient(to left, ${surface}, transparent)`;

export const styles = stylex.create({
  toolbar: {
    gap: space['4'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  search: { maxWidth: '100%', width: '17rem' },
  noWrap: { whiteSpace: 'nowrap' },
  shell: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-surface'],
    width: '100%',
  },
  viewport: {
    '--_cl-scroll-area-fade-end': { default: null, ':has([data-sticky="end"])': '0px' },
    '--_cl-scroll-area-fade-start': { default: null, ':has([data-sticky="start"])': '0px' },
    overscrollBehaviorX: 'none',
  },
  table: {
    '--_cl-table-row-tint': 'transparent',
    '--_cl-table-surface': colorVars['--cl-color-surface'],
    borderCollapse: 'collapse',
    borderSpacing: 0,
    isolation: 'isolate',
    textAlign: 'start',
    width: '100%',
  },
  header: {
    '--_cl-table-surface': colorVars['--cl-color-background-subtle'],
    backgroundColor: colorVars['--cl-color-background-subtle'],
  },
  bodyRow: {
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
  },
  interactiveRow: {
    '--_cl-table-row-tint': {
      default: null,
      '@media (hover: hover)': { ':hover': colorVars['--cl-color-background-subtle'] },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { ':hover': colorVars['--cl-color-background-subtle'] },
    },
    cursor: 'pointer',
  },
  selectedRow: {
    '--_cl-table-row-tint': colorVars['--cl-color-neutral-alpha-100'],
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
    boxSizing: 'content-box',
    lineHeight: 0,
    paddingInlineEnd: 0,
    paddingInlineStart: space['4'],
    verticalAlign: 'middle',
    width: space['4'],
  },
  sticky: {
    backgroundColor: surface,
    backgroundImage: `linear-gradient(${tint}, ${tint})`,
    position: 'sticky',
    zIndex: 1,
    '::before': {
      insetBlock: 0,
      content: '""',
      pointerEvents: 'none',
      position: 'absolute',
      width: scrollFadeVars['--cl-scroll-fade-size'],
    },
  },
  emptyCell: {
    textAlign: 'center',
  },
});

export const layouts = stylex.create({
  auto: { tableLayout: 'auto' },
  fixed: { tableLayout: 'fixed' },
});

export const columnWidth = stylex.create({
  fixed: (width: string) => ({ width }),
});

export const tableMinWidth = stylex.create({
  fixed: (minWidth: string) => ({ minWidth }),
});

export const aligns = stylex.create({
  start: { textAlign: 'start' },
  center: { textAlign: 'center' },
  end: { textAlign: 'end' },
});

export const stickySides = stylex.create({
  start: {
    insetInlineStart: 0,
    '::before': {
      backgroundImage: { default: fadeRight, ':dir(rtl)': fadeLeft },
      insetInlineStart: '100%',
    },
  },
  end: {
    insetInlineEnd: 0,
    '::before': {
      backgroundImage: { default: fadeLeft, ':dir(rtl)': fadeRight },
      insetInlineEnd: '100%',
    },
  },
});
