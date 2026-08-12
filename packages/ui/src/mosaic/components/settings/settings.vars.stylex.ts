import * as stylex from '@stylexjs/stylex';

import { colorVars, space } from '../../tokens.stylex';

export const settingsVars = stylex.defineVars({
  '--cl-settings-background': colorVars['--cl-color-background'],
  '--cl-settings-items-gap': space['2'],
});
