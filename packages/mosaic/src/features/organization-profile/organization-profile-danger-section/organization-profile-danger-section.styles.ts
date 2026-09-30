import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

const compact = '@container cl-section (width < 26rem)';

export const styles = stylex.create({
  item: {
    flexWrap: { [compact]: 'wrap', default: 'nowrap' },
    rowGap: { [compact]: space['3'], default: null },
  },
  actions: {
    justifyContent: { [compact]: 'flex-start', default: 'flex-end' },
    width: { [compact]: '100%', default: null },
  },
});
