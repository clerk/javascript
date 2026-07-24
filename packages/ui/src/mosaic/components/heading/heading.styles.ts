import * as stylex from '@stylexjs/stylex';

import { fontWeightVars } from '../../tokens.stylex';

// Size and intent come from the shared `typography.styles`; a heading only adds
// its weight on top.
export const styles = stylex.create({
  base: { fontWeight: fontWeightVars['--cl-font-semibold'] },
});
