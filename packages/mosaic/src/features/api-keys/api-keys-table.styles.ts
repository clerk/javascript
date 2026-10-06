import * as stylex from '@stylexjs/stylex';

import { fontWeightVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: { gap: space['6'], display: 'flex', flexDirection: 'column', width: '100%' },
  name: { fontWeight: fontWeightVars['--cl-font-medium'] },
  metadata: { gap: space['0.5'], display: 'flex', flexDirection: 'column', minWidth: '25ch' },
  searchSkeleton: { height: space['8'], maxWidth: '100%', width: '17rem' },
  createSkeleton: { height: space['8'], width: space['28'] },
  actionsSkeleton: { width: `calc(${space['7']} + 2 * ${space['4']})` },
});
