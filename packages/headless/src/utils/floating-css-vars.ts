import { detectOverflow, type Middleware } from '@floating-ui/react';

/**
 * Floating UI middleware that sets CSS custom properties on the floating element:
 *
 * - `--anchor-width`      – reference element width (px)
 * - `--anchor-height`     – reference element height (px)
 * - `--available-width`   – available width between anchor and viewport edge (px)
 * - `--available-height`  – available height between anchor and viewport edge (px)
 * - `--transform-origin`  – CSS transform-origin pointing back toward the anchor
 *
 * Place **after** `arrow()` so arrow position data is available for transform-origin.
 */
export function floatingCssVars(opts?: { sideOffset?: number }): Middleware {
  return {
    name: 'floatingCssVars',
    async fn(state) {
      const { elements, rects, middlewareData, placement } = state;
      const style = elements.floating.style;
      const sideOffset = opts?.sideOffset ?? 0;

      // Anchor dimensions
      style.setProperty('--anchor-width', `${rects.reference.width}px`);
      style.setProperty('--anchor-height', `${rects.reference.height}px`);

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

      style.setProperty('--available-width', `${availableWidth}px`);
      style.setProperty('--available-height', `${availableHeight}px`);

      // Transform origin — points back toward the anchor
      const arrowEl = elements.floating.querySelector("[data-cl-slot$='-arrow']") as HTMLElement | null;

      let transformX: number;
      let transformY: number;

      if (arrowEl) {
        const arrowX = middlewareData.arrow?.x ?? 0;
        const arrowY = middlewareData.arrow?.y ?? 0;
        transformX = arrowX + arrowEl.clientWidth / 2;
        transformY = arrowY + arrowEl.clientHeight / 2;
      } else {
        // No arrow — use the anchor's center relative to the floating element
        transformX = rects.reference.x + rects.reference.width / 2 - state.x;
        transformY = rects.reference.y + rects.reference.height / 2 - state.y;
      }

      const originMap: Record<string, string> = {
        top: `${transformX}px calc(100% + ${sideOffset}px)`,
        bottom: `${transformX}px ${-sideOffset}px`,
        left: `calc(100% + ${sideOffset}px) ${transformY}px`,
        right: `${-sideOffset}px ${transformY}px`,
      };

      style.setProperty('--transform-origin', originMap[side]);

      return {};
    },
  };
}
