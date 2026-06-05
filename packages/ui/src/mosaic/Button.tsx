import React from 'react';

import { cva, type VariantProps } from './cva';
import { useMosaicTheme } from './MosaicProvider';

const styles = cva(theme => ({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    gap: theme.spacing(2),
    borderRadius: theme.radius.md,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s',
    '&:focus-visible': {
      outline: `2px solid ${theme.alpha('primary', 50)}`,
      outlineOffset: '2px',
    },
  },
  variants: {
    color: {
      primary: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryForeground,
        '&:hover': { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
        '&:active': { backgroundColor: theme.mix('primary', 'primaryForeground', 24) },
      },
    },
    size: {
      sm: { padding: `${theme.spacing(0.2)} ${theme.spacing(2)}`, fontSize: '0.75rem' },
      md: { padding: `${theme.spacing(2)} ${theme.spacing(4)}`, fontSize: '0.875rem' },
    },
    disabled: {
      false: null,
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  },
  defaultVariants: { color: 'primary', size: 'md', disabled: false },
}));

type ButtonProps = React.ComponentPropsWithRef<'button'> & VariantProps<typeof styles>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { color, size, disabled, sx, children, ...rest } = props;
  const theme = useMosaicTheme();
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      type='button'
      {...rest}
      css={styles({ color, size, disabled, sx })(theme)}
    >
      {children}
    </button>
  );
});
