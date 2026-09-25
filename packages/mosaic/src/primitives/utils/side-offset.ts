import type { Placement } from '@floating-ui/react';

/**
 * The gap between a floating element and what it is anchored to, in px. One number covers every
 * placement. `{ x, y }` gives the horizontal and vertical sides a gap each, which a surface that can
 * flip between the two axes wants: what it has to clear sideways is not what it has to clear above.
 */
export type SideOffset = number | { x: number; y: number };

/** Picks the gap the placement's own axis asks for. */
export function resolveSideOffset(offset: SideOffset, placement: Placement): number {
  if (typeof offset === 'number') {
    return offset;
  }
  const side = placement.split('-')[0];
  return side === 'left' || side === 'right' ? offset.x : offset.y;
}
