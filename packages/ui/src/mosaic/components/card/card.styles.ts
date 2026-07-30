import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-element'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['5'],
    width: '100%',
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
    paddingInline: space['4'],
    paddingBlockEnd: space['5'],
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
