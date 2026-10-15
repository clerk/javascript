import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

export const styles = stylex.create({
  copyableValue: {
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
    minWidth: 0,
  },
  copyableText: { minWidth: 0 },
  copyAction: { flexShrink: 0 },
});
