import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  // `Card.Content` is a plain box, so the stack of banner and form is spaced here.
  content: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
  },
});
