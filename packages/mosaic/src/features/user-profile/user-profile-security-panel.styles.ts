import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  deviceLabel: {
    alignItems: 'center',
    columnGap: space['2'],
    display: 'flex',
    flexWrap: 'wrap',
  },
  icon: {
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'block',
    height: space['4.5'],
    width: space['4.5'],
  },
  media: {
    borderColor: colorVars['--cl-color-border-subtle'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-background-subtle'],
  },
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  sectionCards: {
    gap: space['3'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  sections: {
    gap: space['10'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
