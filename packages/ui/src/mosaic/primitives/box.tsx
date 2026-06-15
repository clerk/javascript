import { type ComponentProps, renderElement } from '@clerk/headless/utils';
import React from 'react';

/**
 * The headless Box primitive: a general-purpose element with render-prop polymorphism and no
 * styles of its own. The mosaic styled layer (`components/box.tsx`) passes `css` at the JSX
 * boundary, where Emotion turns it into a `className` that this part forwards to its rendered
 * DOM node — the same boundary the `withMosaicSlot` bridge relies on.
 */
export type BoxProps = ComponentProps<'div'>;

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(function Box(props, ref) {
  const { render, ...rest } = props;
  return renderElement({ defaultTagName: 'div', render, props: { ...rest, ref } });
});
