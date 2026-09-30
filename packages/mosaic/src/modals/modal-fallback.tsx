import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Spinner } from '../components/spinner';
import { mergeStyleProps, themeProps } from '../props';
import { styles } from './modal-fallback.styles';

export function ModalFallback(): React.ReactElement {
  return (
    <div
      aria-busy
      {...mergeStyleProps(themeProps('modal-fallback'), stylex.props(styles.root))}
    >
      <Spinner />
    </div>
  );
}
