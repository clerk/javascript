import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { styles } from './icon-frame.styles';

export type IconFrameProps = MosaicComponentProps<'span'>;

export const IconFrame = React.forwardRef<HTMLSpanElement, IconFrameProps>(function MosaicIconFrame(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('icon-frame'), stylex.props(reset.base, styles.base), className, style),
      ...rest,
    },
  });
});
