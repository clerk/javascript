import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './button.styles';

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  intent?: 'primary' | 'destructive';
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  shape?: 'default' | 'square' | 'circle';
  fullWidth?: boolean;
}

/**
 * A clickable action styled by the Mosaic recipe. Renders a `button` and forwards its
 * ref; `intent`, `variant`, `size`, and `shape` compose to cover the full set of styles.
 *
 * @example
 * // Default (primary, filled, md)
 * <Button>Save</Button>
 *
 * @example
 * // Destructive intent with a non-filled variant
 * <Button intent='destructive' variant='outline'>Delete</Button>
 *
 * @example
 * // Icon-only, circular, small
 * <Button shape='circle' size='sm' aria-label='Close'><CloseIcon /></Button>
 *
 * @example
 * // Full-width ghost button
 * <Button variant='ghost' fullWidth>Continue</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(
  {
    intent = 'primary',
    variant = 'filled',
    size = 'md',
    shape = 'default',
    fullWidth = false,
    disabled = false,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const isIconShape = shape === 'square' || shape === 'circle';
  return (
    <button
      ref={ref}
      type='button'
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('button', { intent, variant, size, shape, fullWidth, disabled }),
        stylex.props(
          styles.base,
          variant === 'filled' && intent === 'primary' && styles.filledPrimary,
          variant === 'filled' && intent === 'destructive' && styles.filledDestructive,
          variant === 'outline' && intent === 'primary' && styles.outlinePrimary,
          variant === 'outline' && intent === 'destructive' && styles.outlineDestructive,
          variant === 'ghost' && intent === 'primary' && styles.ghostPrimary,
          variant === 'ghost' && intent === 'destructive' && styles.ghostDestructive,
          size === 'sm' ? styles.sizeSm : styles.sizeMd,
          shape === 'square' && styles.shapeSquare,
          shape === 'circle' && styles.shapeCircle,
          isIconShape && (size === 'sm' ? styles.iconSizeSm : styles.iconSizeMd),
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
        ),
        className,
        style,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
