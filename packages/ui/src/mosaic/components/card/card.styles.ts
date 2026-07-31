import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['5'],
    width: '100%',
  },
  raised: {
    borderRadius: radiusVars['--cl-radius-container'],
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px oklch(0.2046 0 0 / 12%),
                0 24px 24px -10px oklch(0.2046 0 0 / 4%),
                0 0 0 1px oklch(0.2046 0 0 / 4%)`,
  },
  flush: {
    borderRadius: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  header: {
    paddingInline: space['4'],
    display: 'flex',
    flexDirection: 'column',
    paddingBlockStart: space['5'],
  },
  content: {
    paddingInline: space['4'],
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
  },
  footer: {
    gap: space['2'],
    paddingBlock: space['4'],
    paddingInline: space['6'],
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'space-between',
    width: '100%',
  },
  'footer-raised': {
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-card-foreground']} 4%, ${colorVars['--cl-color-card']})`,
    borderTopColor: colorVars['--cl-color-border'],
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  'footer-flush': {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
});

export const headerAlignments = stylex.create({
  start: {
    alignItems: 'flex-start',
    textAlign: 'start',
  },
  center: {
    alignItems: 'center',
    textAlign: 'center',
  },
});
