import * as stylex from '@stylexjs/stylex';

import { colorVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  option: { paddingBlock: space['3'], position: 'relative', height: 'auto', minHeight: space['16'] },
  selected: {
    borderColor: colorVars['--cl-color-foreground'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
  },
  description: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    whiteSpace: 'normal',
  },
});
