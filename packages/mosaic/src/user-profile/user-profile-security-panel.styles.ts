import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space } from '../tokens.stylex';

export const styles = stylex.create({
  currentDevice: {
    color: colorVars['--cl-color-positive'],
  },
  descriptionLine: {
    columnGap: space['1'],
    display: 'flex',
    flexWrap: 'wrap',
  },
  icon: {
    color: colorVars['--cl-color-neutral-faded'],
    display: 'block',
    height: space['4.5'],
    width: space['4.5'],
  },
  media: {
    borderColor: colorVars['--cl-color-border-faded'],
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-background'],
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
