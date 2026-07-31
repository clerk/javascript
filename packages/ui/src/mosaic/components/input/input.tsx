import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { sizes, styles } from './input.styles';

export interface InputProps extends Omit<MosaicComponentProps<'input'>, 'size'> {
  size?: 'sm' | 'md';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(
  { size = 'md', disabled = false, render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'input',
    render,
    ref,
    props: {
      disabled,
      ...mergeStyleProps(
        themeProps('input', { size, disabled }),
        stylex.props(styles.base, sizes[size], disabled && styles.disabled),
        className,
        style,
      ),
      ...rest,
    },
  });
});
