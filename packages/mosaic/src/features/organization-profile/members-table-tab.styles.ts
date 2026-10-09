import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  deprovisionedRow: { opacity: 0.5 },
  name: { gap: space['2'], alignItems: 'center', display: 'flex' },
});
