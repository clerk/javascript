import type { ComponentProps, RenderProp } from '@clerk/headless/utils';
import { useRender } from '@clerk/headless/utils';
import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import { useContextProps } from '../utils/context';

/**
 * Mosaic heading slot recipe.
 * Provides variants for size ('xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl')
 * and intent ('primary' | 'mutedForeground' | 'destructive').
 */
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
      primaryForeground: { color: theme.color.primaryForeground },
      destructive: { color: theme.color.destructive },
      destructiveForeground: { color: theme.color.destructiveForeground },
      muted: { color: theme.color.muted },
      mutedForeground: { color: theme.color.mutedForeground },
    },
  },
  defaultVariants: { size: 'base', intent: 'primary' },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    heading: true;
  }
}

/** Props for the Heading component combining h2 attributes with recipe variants. */
export type HeadingProps = Omit<ComponentProps<'h2'>, 'render'> & {
  render?: RenderProp<React.ComponentPropsWithRef<'h2'>> | React.ReactElement;
} & RecipeVariantProps<typeof headingRecipe>;

export const HeadingContext = React.createContext<Partial<HeadingProps> | null>(null);

/**
 * Themeable heading component.
 * Renders as an h2 element by default, forwards refs, and supports
 * size and intent variants plus Mosaic styling (sx prop and render callback).
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function MosaicHeading(rawProps, ref) {
  const { size, intent, sx, render, ...rest } = useContextProps(rawProps, HeadingContext);
  const { root } = useRecipe(headingRecipe, { variants: { size, intent }, sx });
  // useRender only runs for `render` (function or element); Emotion processes `css`
  // inside the consumer's own JSX there. The no-render fallback must stay JSX —
  // React.createElement bypasses Emotion's factory, leaking css to the DOM.
  const element = useRender({
    defaultTagName: 'h2',
    render,
    ref,
    enabled: Boolean(render),
    props: { ...root, ...rest },
  });
  if (element) {
    return element;
  }
  return (
    <h2
      ref={ref}
      {...root}
      {...rest}
    />
  );
});
