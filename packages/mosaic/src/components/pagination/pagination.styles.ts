import * as stylex from '@stylexjs/stylex';

import { colorVars, space, typeScaleVars } from '../../tokens.stylex';

const compact = '@container cl-pagination (width < 48rem)' as const;

export const styles = stylex.create({
  root: {
    containerName: 'cl-pagination',
    containerType: 'inline-size',
    width: '100%',
  },
  layout: {
    gap: space['4'],
    alignItems: { [compact]: 'stretch', default: 'center' },
    display: 'flex',
    flexDirection: { [compact]: 'column', default: 'row' },
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summary: {
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
    flexWrap: { [compact]: 'nowrap', default: 'wrap' },
    justifyContent: { [compact]: 'space-between', default: 'flex-start' },
  },
  pageSize: {
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
  },
  controls: {
    gap: space['1'],
    alignItems: 'center',
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: { [compact]: '1px', default: 0 },
    display: { [compact]: 'grid', default: 'flex' },
    gridTemplateColumns: { [compact]: '1fr auto 1fr', default: 'none' },
    paddingBlockStart: { [compact]: space['4'], default: 0 },
  },
  controlGroup: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
  },
  controlGroupEnd: {
    justifySelf: 'end',
  },
  text: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    whiteSpace: 'nowrap',
  },
  divider: {
    backgroundColor: colorVars['--cl-color-border'],
    display: { [compact]: 'none', default: 'block' },
    height: '1.25rem',
    width: '1px',
  },
  pageSizeLabel: {
    display: { [compact]: 'none', default: 'inline' },
  },
  pageSizeLabelCompact: {
    display: { [compact]: 'inline', default: 'none' },
  },
  pageLabel: {
    paddingInline: space['1'],
  },
  pageSizeOption: {
    paddingBlock: 0,
    paddingInline: space['2'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    minHeight: space['7'],
  },
});
