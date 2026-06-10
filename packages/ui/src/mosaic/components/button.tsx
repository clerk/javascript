import React from 'react';

import { cva, type VariantProps } from '../cva';
import { useMosaicTheme } from '../MosaicProvider';

/** CVA style definition for `Button` variants (`intent`, `size`, `disabled`). */
export const buttonStyles = cva(theme => ({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: theme.spacing(2),
    paddingBlock: theme.spacing(1),
    gap: theme.spacing(2),
    borderRadius: theme.rounded.md,
    fontWeight: 500,
    ...theme.text('sm'),
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s',
    '&:focus-visible': {
      outline: `2px solid ${theme.alpha('primary', 50)}`,
      outlineOffset: '2px',
    },
  },
  variants: {
    intent: {
      primary: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryForeground,
        '&:hover': { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
        '&:active': { backgroundColor: theme.mix('primary', 'primaryForeground', 24) },
      },
    },
    size: {
      sm: { padding: `${theme.spacing(0.2)} ${theme.spacing(2)}`, ...theme.text('xs') },
      md: { padding: `${theme.spacing(2)} ${theme.spacing(4)}`, ...theme.text('sm') },
    },
    disabled: {
      false: null,
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  },
  defaultVariants: { intent: 'primary', size: 'md', disabled: false },
}));

/** Props for {@link Button}. */
export type ButtonProps = React.ComponentPropsWithRef<'button'> & VariantProps<typeof buttonStyles>;

/** Styled mosaic Button component with `intent`, `size`, and `disabled` variants. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { intent, size, disabled, sx, children, ...rest } = props;
  const theme = useMosaicTheme();
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      type='button'
      {...rest}
      css={buttonStyles({ intent, size, disabled, sx })(theme)}
    >
      {children}
    </button>
  );
});
