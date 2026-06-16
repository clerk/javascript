import React from 'react';

import type { ComponentProps } from '@clerk/headless/utils';
import { renderElement } from '@clerk/headless/utils';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

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
      mutedForeground: { color: theme.color.mutedForeground },
      destructive: { color: theme.color.destructive },
    },
  },
  defaultVariants: { size: 'sm', intent: 'primary' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    text: true;
  }
}

export type TextProps = ComponentProps<'p'> & RecipeVariantProps<typeof textRecipe>;

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
