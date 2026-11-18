import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { mediaSizes } from '../../styles/media-size.styles';
import { reset } from '../../styles/reset.styles';
import { styles } from './icon-frame.styles';

export interface IconFrameProps extends MosaicComponentProps<'span'> {
  bordered?: boolean;
  filled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const IconFrame = React.forwardRef<HTMLSpanElement, IconFrameProps>(function MosaicIconFrame(
  { bordered = true, filled = false, size = 'md', render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('icon-frame', { bordered, filled, size }),
        stylex.props(
          reset.base,
          styles.base,
          mediaSizes[size],
          bordered && styles.bordered,
          filled && styles.filled,
          xstyle,
        ),
        rest,
      ),
    },
  });
});
