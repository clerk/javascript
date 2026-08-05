import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicElementProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { truncationStyles } from '../typography.styles';
import { iconSizes, sizes, styles, variants } from './button.styles';

export interface ButtonProps extends MosaicElementProps<'button'> {
  color?: 'primary' | 'neutral' | 'negative';
  variant?: 'filled' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'default' | 'square' | 'circle';
  fullWidth?: boolean;
  /**
   * Floors the hit area at the recommended touch target under a coarse pointer, without
   * changing the rendered size. Defaults to `true`. Pass `false` where buttons sit close
   * enough that the grown areas would overlap — a dense icon toolbar, a tight stack — since
   * the later sibling's area would otherwise cover the edge of the one before it. Has no
   * effect on `variant='link'`, which is text rather than a control.
   */
  touchTarget?: boolean;
}

/**
 * A clickable action styled by the Mosaic recipe. Renders a `button` and forwards its
 * ref; `color`, `variant`, and `size` are independent axes, with `shape` and `fullWidth`
 * as orthogonal modifiers.
 *
 * @example
 * // Default (primary, filled, md)
 * <Button>Save</Button>
 *
 * @example
 * // Negative color with a non-filled variant
 * <Button color='negative' variant='outline'>Delete</Button>
 *
 * @example
 * // Icon-only, circular, small
 * <Button shape='circle' size='sm' aria-label='Close'><CloseIcon /></Button>
 *
 * @example
 * // Full-width ghost button
 * <Button variant='ghost' fullWidth>Continue</Button>
 */
// Wrap the text children so they have a box of their own to truncate against — a bare text
// child is laid out in an anonymous flex item that no selector can reach. A whole run of
// adjacent text shares one box, or `Delete {name}` would split into two flex items with the
// button's `gap` opening up mid-sentence. Element children (icons) pass through untouched,
// so they stay direct flex items and `gap` still applies.
function withTruncatableLabel(children: React.ReactNode): React.ReactNode {
  const result: React.ReactNode[] = [];
  let run: React.ReactNode[] = [];

  const flushRun = () => {
    if (run.length === 0) {
      return;
    }
    result.push(
      <span
        key={`label-${result.length}`}
        {...stylex.props(truncationStyles.singleLine, styles.label)}
      >
        {run}
      </span>,
    );
    run = [];
  };

  // `toArray` rather than `forEach` so the elements it passes through carry the keys it
  // assigns, and the array this returns doesn't warn about missing ones.
  for (const child of React.Children.toArray(children)) {
    if (typeof child === 'string' || typeof child === 'number') {
      run.push(child);
    } else {
      flushRun();
      result.push(child);
    }
  }
  flushRun();

  return result;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(
  {
    color = 'primary',
    variant = 'filled',
    size = 'md',
    shape = 'default',
    fullWidth = false,
    touchTarget = true,
    disabled = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const isIconShape = shape === 'square' || shape === 'circle';
  const hasTouchTarget = touchTarget && variant !== 'link';
  return (
    <button
      ref={ref}
      type='button'
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('button', { color, variant, size, shape, fullWidth, disabled }),
        stylex.props(
          styles.base,
          sizes[size],
          variants[`${variant}-${color}`],
          shape === 'square' && styles.shapeSquare,
          shape === 'circle' && styles.shapeCircle,
          isIconShape && iconSizes[size],
          hasTouchTarget && styles.touchTarget,
          hasTouchTarget && isIconShape && styles.touchTargetIcon,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
        ),
        className,
        style,
      )}
      {...rest}
    >
      {withTruncatableLabel(children)}
    </button>
  );
});
