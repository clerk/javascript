import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { sizes, styles } from './icon-frame.styles';

export interface IconFrameProps extends MosaicComponentProps<'span'> {
  bordered?: boolean;
  filled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const IconFrame = React.forwardRef<HTMLSpanElement, IconFrameProps>(function MosaicIconFrame(
  { bordered = true, filled = false, size = 'xl', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('icon-frame', { bordered, filled, size }),
        stylex.props(reset.base, styles.base, sizes[size], bordered && styles.bordered, filled && styles.filled),
        className,
        style,
      ),
      ...rest,
    },
  });
});
