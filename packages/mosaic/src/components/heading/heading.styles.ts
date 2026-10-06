import * as stylex from '@stylexjs/stylex';

import { fontWeightVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: { fontWeight: fontWeightVars['--cl-font-semibold'] },
});
