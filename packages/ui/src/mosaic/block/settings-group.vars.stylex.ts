import * as stylex from '@stylexjs/stylex';

import { colorVars } from '../tokens.stylex';

export const settingsVars = stylex.defineVars({
  '--cl-settings-background': colorVars['--cl-color-background'],
});
