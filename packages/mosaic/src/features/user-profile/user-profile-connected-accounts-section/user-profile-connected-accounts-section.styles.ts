import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

export const styles = stylex.create({
  connectRow: { justifyContent: 'center' },
  label: { gap: space['2'], alignItems: 'center', display: 'flex', flexWrap: 'wrap' },
  text: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
});
