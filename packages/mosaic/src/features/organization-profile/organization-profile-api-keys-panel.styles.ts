import * as stylex from '@stylexjs/stylex';

import { fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  name: { fontWeight: fontWeightVars['--cl-font-medium'] },
  metadata: { gap: space['0.5'], display: 'flex', flexDirection: 'column', minWidth: '25ch' },
});
