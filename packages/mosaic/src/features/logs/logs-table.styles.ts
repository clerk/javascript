import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  root: { gap: space['6'], display: 'flex', flexDirection: 'column', width: '100%' },
  event: { gap: space['0.5'], alignItems: 'flex-start', display: 'flex', flexDirection: 'column', minWidth: 0 },
});
