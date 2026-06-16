import React from 'react';

import type { ComponentProps } from '@clerk/headless/utils';
import { renderElement } from '@clerk/headless/utils';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/**
 * Mosaic text slot recipe.
 * Provides variants for size ('xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl')
 * and intent ('primary' | 'mutedForeground' | 'destructive').
 */
export const textRecipe = defineSlotRecipe(theme => ({
  slot: 'text',
  base: {},
  variants: {
    size: {
      xs: { ...theme.text('xs') },
      sm: { ...theme.text('sm') },
      base: { ...theme.text('base') },
      lg: { ...theme.text('lg') },
      xl: { ...theme.text('xl') },
      '2xl': { ...theme.text('2xl') },
    },
    intent: {
      primary: { color: theme.color.primary },
      primaryForeground: { color: theme.color.primaryForeground },
      destructive: { color: theme.color.destructive },
      destructiveForeground: { color: theme.color.destructiveForeground },
      muted: { color: theme.color.muted },
      mutedForeground: { color: theme.color.mutedForeground },
    },
  },
  defaultVariants: { size: 'sm', intent: 'primary' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    text: true;
  }
}

/** Props for the Text component combining p element attributes with recipe variants. */
export type TextProps = ComponentProps<'p'> & RecipeVariantProps<typeof textRecipe>;

/**
 * Themeable text component.
 * Renders as a p element by default, forwards refs, and supports
 * size and intent variants plus Mosaic styling (sx prop and render callback).
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(function MosaicText(props, ref) {
  const { size, intent, sx, render, ...rest } = props;
  const { root } = useRecipe(textRecipe, { variants: { size, intent }, sx });
  if (render) {
    return renderElement({ defaultTagName: 'p', render, props: { ref, ...root, ...rest } as Record<string, unknown> });
  }
  return (
    <p
      ref={ref}
      {...root}
      {...rest}
    />
  );
});
