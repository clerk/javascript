import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

export const separatorGap = stylex.create({
  tight: {
    marginBlock: `calc(-1 * ${space['2']})`,
  },
});
