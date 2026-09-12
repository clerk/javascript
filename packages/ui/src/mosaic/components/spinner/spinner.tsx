import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { sizes, styles } from './spinner.styles';

export type SpinnerProps = MosaicElementProps<'span'> & {
  size?: 'sm' | 'md';
};

/**
 * Indeterminate loading spinner. Decorative (`aria-hidden`) — pair it with a disabled control or an
 * `aria-busy` container so assistive tech is informed of the pending state.
 *
 * @example
 * // Default (md), sized to match a `md` Icon
 * <Spinner />
 *
 * @example
 * // Standing in for a `sm` Icon
 * <Spinner size='sm' />
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function MosaicSpinner(
  { size = 'md', className, style, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden
      {...mergeStyleProps(themeProps('spinner', { size }), stylex.props(styles.base, sizes[size]), className, style)}
      {...rest}
    />
  );
});
