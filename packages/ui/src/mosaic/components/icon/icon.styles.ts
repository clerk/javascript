import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  base: { display: 'inline-block', flexShrink: 0 },
});

export const sizes = stylex.create({
  sm: { height: space['3.5'], width: space['3.5'] },
  md: { height: space['4'], width: space['4'] },
  lg: { height: space['5'], width: space['5'] },
});
