import React from 'react';

import { cva, type VariantProps } from '../cva';
import { useMosaicTheme } from '../MosaicProvider';

export const inputStyles = cva(theme => ({
  base: {
    display: 'block',
    height: theme.spacing(8),
    width: '100%',
    minWidth: 0,
    paddingInline: theme.spacing(2.5),
    borderRadius: theme.rounded.lg,
    border: `1px solid ${theme.alpha('primary', 30)}`,
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    ...theme.text('base'),
    outline: 'none',
    transition: 'color 0.15s, background-color 0.15s, border-color 0.15s',
    '@media (min-width: 768px)': { ...theme.text('sm') },
    '&::placeholder': { color: theme.alpha('primary', 40) },
    '&::file-selector-button': {
      display: 'inline-flex',
      height: theme.spacing(6),
      border: 0,
      backgroundColor: 'transparent',
      ...theme.text('sm'),
      fontWeight: 500,
      color: 'inherit',
    },
    '&:focus-visible': {
      borderColor: theme.color.primary,
      boxShadow: `0 0 0 3px ${theme.alpha('primary', 20)}`,
    },
    '&[aria-invalid="true"]': {
      borderColor: theme.color.primary,
      boxShadow: `0 0 0 3px ${theme.alpha('primary', 15)}`,
    },
  },
  variants: {
    size: {
      sm: { height: theme.spacing(7), paddingInline: theme.spacing(2), ...theme.text('xs') },
      md: { height: theme.spacing(8), paddingInline: theme.spacing(2.5) },
    },
    disabled: {
      false: null,
      true: {
        pointerEvents: 'none',
        cursor: 'not-allowed',
        backgroundColor: theme.alpha('primary', 5),
        opacity: 0.5,
      },
    },
  },
  defaultVariants: { size: 'md', disabled: false },
}));

export type InputProps = Omit<React.ComponentPropsWithRef<'input'>, 'size'> & VariantProps<typeof inputStyles>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(props, ref) {
  const { size, disabled, sx, ...rest } = props;
  const theme = useMosaicTheme();
  return (
    <input
      ref={ref}
      disabled={disabled || false}
      {...rest}
      css={inputStyles({ size, disabled, sx })(theme)}
    />
  );
});
