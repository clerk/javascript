import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

export const deleteAccountDialogStyles = stylex.create({
  field: {
    gap: space['2'],
    display: 'grid',
  },
  form: {
    gap: space['3'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
