'use client';

import { type RefObject, useLayoutEffect } from 'react';

import { createLayoutAnimator, LAYOUT_ITEM_ATTRIBUTE } from '../utils/layout-animator';

const itemProps = { [LAYOUT_ITEM_ATTRIBUTE]: '' } as const;

/**
 * Slides the elements inside `ref` that spread the returned `itemProps` to their new position
 * whenever the DOM under it changes. An item that gets `data-ending-style` is pinned where it was with `position: absolute`, so
 * its siblings move into its place while its own exit transition runs.
 *
 * The element must be the items' `offsetParent`. Timing comes from its `--cl-layout-duration` and
 * `--cl-layout-easing`. With no duration, or under `prefers-reduced-motion: reduce`, items snap.
 * Items animate the `translate` property, so their own styles must not set it.
 */
export function useLayoutAnimation(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    return createLayoutAnimator(element);
  }, [ref]);

  return { itemProps };
}
