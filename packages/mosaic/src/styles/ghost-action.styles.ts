import * as stylex from '@stylexjs/stylex';

import { space } from '../tokens.stylex';

const lgButtonHeight = space['9'];

export const ghostAction = stylex.create({
  trailing: {
    marginBlockEnd: { default: 0, ':last-child': `calc(1lh - ${lgButtonHeight})` },
    marginBlockStart: { default: space['2'], ':first-child': `calc((1lh - ${lgButtonHeight}) / 2)` },
  },
});
