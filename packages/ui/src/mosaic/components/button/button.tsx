import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeProps, themeProps } from '../../props';
import { styles } from './button.styles';

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  intent?: 'primary' | 'destructive';
  variant?: 'filled' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  shape?: 'default' | 'square' | 'circle';
  fullWidth?: boolean;
}

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
      {...mergeProps(
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
