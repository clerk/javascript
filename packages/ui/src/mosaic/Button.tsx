import React from 'react';

import { cva, type VariantProps } from './cva';
import { useMosaicTheme } from './MosaicProvider';

const styles = cva(theme => ({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s',
    '&:focus-visible': {
      outline: `2px solid ${theme.color.ring}`,
      outlineOffset: '2px',
    },
  },
  variants: {
    intent: {
      primary: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryContrast,
        '&:hover': { backgroundColor: theme.color.primaryHover },
        '&:active': { backgroundColor: theme.color.primaryActive },
      },
      outline: {
        backgroundColor: 'transparent',
        color: theme.color.fg,
        border: `1px solid ${theme.color.border}`,
        '&:hover': { backgroundColor: theme.color.surface },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.color.fg,
        '&:hover': { backgroundColor: theme.color.surface },
      },
    },
    size: {
      sm: { padding: `${theme.spacing.xs} ${theme.spacing.sm}`, fontSize: '0.75rem' },
      md: { padding: `${theme.spacing.sm} ${theme.spacing.md}`, fontSize: '0.875rem' },
    },
    disabled: {
      false: null,
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' as const },
    },
  },
  compoundVariants: [
    { intent: 'primary', disabled: false, css: { '&:hover': { backgroundColor: theme.color.primaryHover } } },
  ],
  defaultVariants: { intent: 'primary', size: 'md', disabled: false },
}));

type ButtonProps = React.ComponentPropsWithRef<'button'> & VariantProps<typeof styles>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { intent, size, disabled, children, ...rest } = props;
  const theme = useMosaicTheme();
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      type='button'
      {...rest}
      css={styles({ intent, size, disabled })(theme)}
    >
      {children}
    </button>
  );
});
