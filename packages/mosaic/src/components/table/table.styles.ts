import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  focusVars,
  fontWeightVars,
  radiusVars,
  scrollFadeVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';
import { tableStateMarker } from './table.markers.stylex';

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
    borderColor: colorVars['--cl-color-border-subtle'],
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
    '--_cl-table-surface': colorVars['--cl-color-surface-subtle'],
    backgroundColor: colorVars['--cl-color-surface-subtle'],
  },
  row: {
    '--_cl-table-row-tint': {
      default: null,
      ':where([data-selected])': colorVars['--cl-color-neutral-alpha-100'],
      '@media (hover: hover)': {
        default: null,
        ':where([data-actionable]:not([data-selected]):hover)': colorVars['--cl-color-surface-subtle'],
      },
    },
    backgroundColor: {
      default: null,
      ':where([data-selected])': colorVars['--cl-color-neutral-alpha-100'],
      '@media (hover: hover)': {
        default: null,
        ':where([data-actionable]:not([data-selected]):hover)': colorVars['--cl-color-surface-subtle'],
      },
    },
    borderBlockStartColor: colorVars['--cl-color-border-subtle'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: '1px',
    cursor: { default: null, ':where([data-actionable])': 'pointer' },
    position: 'relative',
  },
  column: {
    paddingBlock: space['2.5'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    position: 'relative',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  sortableColumn: {
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      '@media (hover: hover)': { default: null, ':hover': colorVars['--cl-color-foreground'] },
    },
    cursor: 'pointer',
    userSelect: 'none',
  },
  sortLabel: {
    gap: space['1'],
    alignItems: 'center',
    display: 'inline-flex',
  },
  cell: {
    paddingBlock: space['3'],
    paddingInline: space['4'],
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    position: 'relative',
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
    zIndex: { default: 1, ':focus-visible': 2 },
    '::before': {
      insetBlock: 0,
      content: '""',
      pointerEvents: 'none',
      position: 'absolute',
      width: scrollFadeVars['--cl-scroll-fade-size'],
    },
  },
  focusRing: {
    outlineOffset: { default: null, ':focus-visible': `calc(-1 * ${focusVars['--cl-focus-outline-width']})` },
    zIndex: { default: null, ':focus-visible': 2 },
  },
  empty: {
    textAlign: 'center',
  },
  expandButton: {
    borderRadius: radiusVars['--cl-radius-sm'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    marginInlineEnd: space['1'],
    verticalAlign: 'middle',
  },
  expandIcon: {
    transform: {
      default: null,
      ':is([dir="rtl"] *):not([data-expanded] *)': 'scaleX(-1)',
      [stylex.when.ancestor('[data-expanded]', tableStateMarker)]: 'rotate(90deg)',
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'transform',
  },
});

export const sortIcons = stylex.create({
  none: {
    display: {
      default: 'block',
      [stylex.when.ancestor('[data-sort-direction]', tableStateMarker)]: 'none',
    },
  },
  ascending: {
    display: {
      default: 'none',
      [stylex.when.ancestor('[data-sort-direction="ascending"]', tableStateMarker)]: 'block',
    },
  },
  descending: {
    display: {
      default: 'none',
      [stylex.when.ancestor('[data-sort-direction="descending"]', tableStateMarker)]: 'block',
    },
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
