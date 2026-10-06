import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  actions: { gap: space['2'], display: 'flex', justifyContent: 'flex-end' },
});
