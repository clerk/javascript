import { detectOverflow, type Middleware } from '@floating-ui/react';

import { resolveSideOffset, type SideOffset } from './side-offset';

/**
 * Positioning middleware that sets CSS custom properties on the floating element:
 *
 * - `--cl-anchor-width`      – reference element width (px)
 * - `--cl-anchor-height`     – reference element height (px)
 * - `--cl-available-width`   – available width between anchor and viewport edge (px)
 * - `--cl-available-height`  – available height between anchor and viewport edge (px)
 * - `--cl-transform-origin`  – CSS transform-origin pointing back toward the anchor
 * - `--cl-anchor-origin`     – CSS transform-origin at the anchor's own center
 *
 * Place **after** `arrow()` so arrow position data is available for transform-origin.
 */
export function cssVars(opts?: { sideOffset?: SideOffset }): Middleware {
  return {
    name: 'cssVars',
    async fn(state) {
      const { elements, rects, middlewareData, placement } = state;
      const style = elements.floating.style;
      const sideOffset = resolveSideOffset(opts?.sideOffset ?? 0, placement);

      // Anchor dimensions
      style.setProperty('--cl-anchor-width', `${rects.reference.width}px`);
      style.setProperty('--cl-anchor-height', `${rects.reference.height}px`);

      // Available space
      const overflow = await detectOverflow(state, { padding: 5 });
      const side = placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';

      const availableHeight =
        side === 'top'
          ? rects.floating.height - overflow.top
          : side === 'bottom'
            ? rects.floating.height - overflow.bottom
            : rects.floating.height - Math.max(overflow.top, 0) - Math.max(overflow.bottom, 0);

      const availableWidth =
        side === 'left'
          ? rects.floating.width - overflow.left
          : side === 'right'
            ? rects.floating.width - overflow.right
            : rects.floating.width - Math.max(overflow.left, 0) - Math.max(overflow.right, 0);

      style.setProperty('--cl-available-width', `${availableWidth}px`);
      style.setProperty('--cl-available-height', `${availableHeight}px`);

      // Transform origin — points back toward the anchor
      // The arrow is the only FloatingArrow <svg> descendant carrying data-side.
      const arrowEl = elements.floating.querySelector('svg[data-side]');

      // The anchor's center, relative to the floating element.
      const anchorX = rects.reference.x + rects.reference.width / 2 - state.x;
      const anchorY = rects.reference.y + rects.reference.height / 2 - state.y;

      let transformX: number;
      let transformY: number;

      if (arrowEl) {
        const arrowX = middlewareData.arrow?.x ?? 0;
        const arrowY = middlewareData.arrow?.y ?? 0;
        transformX = arrowX + arrowEl.clientWidth / 2;
        transformY = arrowY + arrowEl.clientHeight / 2;
      } else {
        transformX = anchorX;
        transformY = anchorY;
      }

      const originMap: Record<string, string> = {
        top: `${transformX}px calc(100% + ${sideOffset}px)`,
        bottom: `${transformX}px ${-sideOffset}px`,
        left: `calc(100% + ${sideOffset}px) ${transformY}px`,
        right: `${-sideOffset}px ${transformY}px`,
      };

      style.setProperty('--cl-transform-origin', originMap[side]);
      // Keeps both axes, where `--cl-transform-origin` pins the cross axis to the floating
      // element's own edge. Scaling about this point makes the popup travel out of the
      // anchor instead of growing in place.
      style.setProperty('--cl-anchor-origin', `${anchorX}px ${anchorY}px`);

      return {};
    },
  };
}
