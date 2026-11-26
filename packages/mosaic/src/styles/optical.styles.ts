import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

export const optical = stylex.create({
  trailingChevron: {
    marginInlineEnd: `calc(-1 * ${space['1']})`,
  },
});
