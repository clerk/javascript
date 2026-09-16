import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  label: { gap: space['2'], alignItems: 'center', display: 'flex', flexWrap: 'wrap' },
  error: { marginBlockEnd: space['4'] },
});
