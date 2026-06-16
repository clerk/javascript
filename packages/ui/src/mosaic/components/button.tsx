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
    border: 'none',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s',
    _focusVisible: {
      outline: `2px solid ${theme.alpha('primary', 50)}`,
      outlineOffset: '2px',
    },
    _disabled: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
  },
  variants: {
    color: {
      primary: {
        backgroundColor: theme.color.primary,
        color: theme.color.primaryForeground,
        _hover: { backgroundColor: theme.mix('primary', 'primaryForeground', 12) },
        _active: { backgroundColor: theme.mix('primary', 'primaryForeground', 24) },
      },
      destructive: {
        backgroundColor: theme.color.destructive,
        color: theme.color.destructiveForeground,
        _hover: { backgroundColor: theme.mix('destructive', 'destructiveForeground', 12) },
        _active: { backgroundColor: theme.mix('destructive', 'destructiveForeground', 24) },
      },
      // Low-emphasis companion to `primary` — e.g. the secondary action in a dialog. The
      // border is an inset shadow so it sits flush with `primary` (no extra box size).
      secondary: {
        backgroundColor: 'transparent',
        color: theme.color.primary,
        boxShadow: `inset 0 0 0 1px ${theme.alpha('primary', 20)}`,
        _hover: { backgroundColor: theme.alpha('primary', 6) },
        _active: { backgroundColor: theme.alpha('primary', 12) },
      },
    },
    size: {
      sm: { padding: `${theme.spacing(0.2)} ${theme.spacing(2)}`, ...theme.text('xs') },
      md: { padding: `${theme.spacing(2)} ${theme.spacing(4)}`, ...theme.text('sm') },
    },
  },
  defaultVariants: { color: 'primary', size: 'md' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    button: true;
  }
}

export type ButtonProps = Omit<React.ComponentPropsWithRef<'button'>, 'color'> &
  RecipeVariantProps<typeof buttonRecipe>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function MosaicButton(props, ref) {
  const { color, size, disabled, sx, children, ...rest } = props;
  const { root } = useRecipe(buttonRecipe, { variants: { color, size }, state: { disabled: !!disabled }, sx });
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
