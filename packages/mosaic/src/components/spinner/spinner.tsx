import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { sizes, styles } from './spinner.styles';

export type SpinnerProps = MosaicElementProps<'span'> & {
  size?: 'sm' | 'md';
  label?: string;
};

/**
 * Indeterminate loading spinner. Decorative by default; pass `label` to announce progress.
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
  { size = 'md', label, xstyle, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...mergeStyleProps(themeProps('spinner', { size }), stylex.props(styles.base, sizes[size], xstyle), rest)}
    />
  );
});
