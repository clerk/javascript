import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

export const buttonRecipe = defineSlotRecipe(theme => ({
  slot: 'button',
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
    border: '1px solid transparent',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s',
    _focusVisible: {
      outline: `2px solid ${theme.alpha('primary', 50)}`,
      outlineOffset: '2px',
    },
    _disabled: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
  },
  variants: {
    intent: {
      primary: {},
      destructive: {},
    },
    variant: {
      filled: {},
      outline: {},
      ghost: {},
    },
    size: {
      sm: { padding: `${theme.spacing(0.2)} ${theme.spacing(2)}`, ...theme.text('xs') },
      md: { padding: `${theme.spacing(2)} ${theme.spacing(4)}`, ...theme.text('sm') },
    },
  },
  compoundVariants: [
    {
      intent: 'primary',
      variant: 'filled',
      css: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryForeground,
        _hover: { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
        _active: { backgroundColor: theme.mix('primary', 'primaryForeground', 24) },
      },
    },
    {
      intent: 'destructive',
      variant: 'filled',
      css: {
        backgroundColor: theme.color.destructive,
        color: theme.color.destructiveForeground,
        _hover: { backgroundColor: theme.mix('destructive', 'destructiveForeground', 12) },
        _active: { backgroundColor: theme.mix('destructive', 'destructiveForeground', 24) },
      },
    },
    {
      intent: 'primary',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        borderColor: theme.color.border,
        color: theme.color.primary,
        // TODO
        _hover: {},
        _active: {},
      },
    },
    {
      intent: 'destructive',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        borderColor: theme.color.border,
        color: theme.color.destructive,
        // TODO
        _hover: {},
        _active: {},
      },
    },
    {
      intent: 'primary',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
        color: theme.color.primary,
        // TODO
        _hover: {},
        _active: {},
      },
    },
    {
      intent: 'destructive',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
        color: theme.color.destructive,
        // TODO
        _hover: {},
        _active: {},
      },
    },
  ],
  defaultVariants: { intent: 'primary', size: 'md', variant: 'filled' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    button: true;
  }
}

export type ButtonProps = React.ComponentPropsWithRef<'button'> & RecipeVariantProps<typeof buttonRecipe>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { intent, variant, size, disabled, sx, children, ...rest } = props;
  const { root } = useRecipe(buttonRecipe, {
    variants: { intent, variant, size },
    state: { disabled: !!disabled },
    sx,
  });
  return (
    <button
      ref={ref}
      disabled={disabled || false}
      type='button'
      {...rest}
      {...root}
    >
      {children}
    </button>
  );
});
