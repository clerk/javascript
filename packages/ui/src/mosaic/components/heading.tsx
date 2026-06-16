import React from 'react';

import type { ComponentProps } from '@clerk/headless/utils';
import { renderElement } from '@clerk/headless/utils';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

export const headingRecipe = defineSlotRecipe(theme => ({
  slot: 'heading',
  base: {
    fontWeight: theme.font.semibold,
  },
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
  defaultVariants: { size: 'base', intent: 'primary' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    heading: true;
  }
}

export type HeadingProps = ComponentProps<'h2'> & RecipeVariantProps<typeof headingRecipe>;

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function MosaicHeading(props, ref) {
  const { size, intent, sx, render, ...rest } = props;
  const { root } = useRecipe(headingRecipe, { variants: { size, intent }, sx });
  if (render) {
    // renderElement handles the cast; Emotion processes `css` inside the callback's own JSX.
    return renderElement({ defaultTagName: 'h2', render, props: { ref, ...root, ...rest } as Record<string, unknown> });
  }
  // Fallback must be JSX — React.createElement bypasses Emotion's factory, leaking css to the DOM.
  return (
    <h2
      ref={ref}
      {...root}
      {...rest}
    />
  );
});
