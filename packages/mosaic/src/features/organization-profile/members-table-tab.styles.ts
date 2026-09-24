import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  name: { gap: space['2'], alignItems: 'center', display: 'flex' },
});
