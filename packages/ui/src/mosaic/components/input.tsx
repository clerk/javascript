import React from 'react';

import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import type { RecipeVariantProps } from '../slot-recipe';

export const inputRecipe = defineSlotRecipe(theme => ({
  slot: 'input',
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
    _focusVisible: {
      borderColor: theme.color.primary,
      boxShadow: `0 0 0 3px ${theme.alpha('primary', 20)}`,
    },
    _invalid: {
      borderColor: theme.color.primary,
      boxShadow: `0 0 0 3px ${theme.alpha('primary', 15)}`,
    },
    _disabled: {
      pointerEvents: 'none',
      cursor: 'not-allowed',
      backgroundColor: theme.alpha('primary', 5),
      opacity: 0.5,
    },
  },
  variants: {
    size: {
      sm: { height: theme.spacing(7), paddingInline: theme.spacing(2), ...theme.text('xs') },
      md: { height: theme.spacing(8), paddingInline: theme.spacing(2.5) },
    },
  },
  defaultVariants: { size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    input: true;
  }
}

export type InputProps = Omit<React.ComponentPropsWithRef<'input'>, 'size'> & RecipeVariantProps<typeof inputRecipe>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function MosaicInput(props, ref) {
  const { size, disabled, sx, ...rest } = props;
  const { root } = useRecipe(inputRecipe, { variants: { size }, state: { disabled: !!disabled }, sx });
  return (
    <input
      ref={ref}
      disabled={disabled || false}
      {...rest}
      {...root}
    />
  );
});
