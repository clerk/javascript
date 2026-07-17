import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { cx } from './props';
import { colors, radius, space } from './tokens.stylex';

// Helper to keep spacing math readable. `space['--cl-spacing']` compiles to
// `var(--cl-spacing)`, so this yields e.g. `calc(var(--cl-spacing) * 2)`.
const s = (n: number) => `calc(${space['--cl-spacing']} * ${n})`;

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(2),
    borderRadius: radius['--cl-radius-md'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color, opacity',
    transitionDuration: '150ms',
    outline: {
      default: 'none',
      ':focus-visible': `2px solid color-mix(in oklab, ${colors['--cl-primary']} 50%, transparent)`,
    },
    outlineOffset: '2px',
  },

  // intent × variant
  filledPrimary: {
    backgroundColor: {
      default: colors['--cl-primary'],
      ':hover': `color-mix(in oklab, ${colors['--cl-primary']}, ${colors['--cl-primary-foreground']} 12%)`,
      ':active': `color-mix(in oklab, ${colors['--cl-primary']}, ${colors['--cl-primary-foreground']} 24%)`,
    },
    color: colors['--cl-primary-foreground'],
  },
  filledDestructive: {
    backgroundColor: {
      default: colors['--cl-destructive'],
      ':hover': `color-mix(in oklab, ${colors['--cl-destructive']}, ${colors['--cl-destructive-foreground']} 12%)`,
      ':active': `color-mix(in oklab, ${colors['--cl-destructive']}, ${colors['--cl-destructive-foreground']} 24%)`,
    },
    color: colors['--cl-destructive-foreground'],
  },
  outlinePrimary: {
    backgroundColor: 'transparent',
    borderColor: colors['--cl-border'],
    color: colors['--cl-foreground'],
  },

  // size
  sizeSm: { paddingBlock: s(1), paddingInline: s(2), fontSize: '0.75rem', lineHeight: 'calc(1 / 0.75)' },
  sizeMd: { paddingBlock: s(2), paddingInline: s(4), fontSize: '0.875rem', lineHeight: 'calc(1.25 / 0.875)' },

  // state / modifiers
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
});

export interface ButtonProps extends React.ComponentPropsWithRef<'button'> {
  intent?: 'primary' | 'destructive';
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    intent = 'primary',
    variant = 'filled',
    size = 'md',
    fullWidth = false,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type='button'
      disabled={disabled}
      data-intent={intent}
      data-variant={variant}
      data-size={size}
      {...cx(
        // Stable, consumer-facing targeting class: `.cl-button { … }`. Keep this a
        // literal (enforced by the custom-rules/mosaic-stable-class lint rule) — it
        // is a public styling contract, not an internal identifier.
        'cl-button',
        className,
        styles.base,
        variant === 'filled' && intent === 'primary' && styles.filledPrimary,
        variant === 'filled' && intent === 'destructive' && styles.filledDestructive,
        variant === 'outline' && styles.outlinePrimary,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
