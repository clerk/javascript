import type { ComponentProps, RenderProp } from '@clerk/headless/utils';
import { useRender } from '@clerk/headless/utils';
import React from 'react';

import type { RecipeVariantProps } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import { useContextProps } from '../utils/context';

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
export type TextProps = Omit<ComponentProps<'p'>, 'render'> & {
  render?: RenderProp<React.ComponentPropsWithRef<'p'>> | React.ReactElement;
} & RecipeVariantProps<typeof textRecipe>;

export const TextContext = React.createContext<Partial<TextProps> | null>(null);

/**
 * Themeable text component.
 * Renders as a p element by default, forwards refs, and supports
 * size and intent variants plus Mosaic styling (sx prop and render callback).
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(function MosaicText(rawProps, ref) {
  const { size, intent, sx, render, ...rest } = useContextProps(rawProps, TextContext);
  const { root } = useRecipe(textRecipe, { variants: { size, intent }, sx });
  // useRender only runs for `render` (function or element); Emotion processes `css`
  // inside the consumer's own JSX there. The no-render fallback must stay JSX —
  // React.createElement bypasses Emotion's factory, leaking css to the DOM.
  const element = useRender({
    defaultTagName: 'p',
    render,
    ref,
    enabled: Boolean(render),
    props: { ...root, ...rest },
  });
  if (element) {
    return element;
  }
  return (
    <p
      ref={ref}
      {...root}
      {...rest}
    />
  );
});
