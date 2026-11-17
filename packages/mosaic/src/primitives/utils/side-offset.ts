import type { Alignment, Placement, Side } from '@floating-ui/react';

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
  const { side } = parsePlacement(placement);
  return side === 'left' || side === 'right' ? offset.x : offset.y;
}

const PLACEMENTS: Record<Placement, { side: Side; align: Alignment | 'center' }> = {
  top: { side: 'top', align: 'center' },
  'top-start': { side: 'top', align: 'start' },
  'top-end': { side: 'top', align: 'end' },
  right: { side: 'right', align: 'center' },
  'right-start': { side: 'right', align: 'start' },
  'right-end': { side: 'right', align: 'end' },
  bottom: { side: 'bottom', align: 'center' },
  'bottom-start': { side: 'bottom', align: 'start' },
  'bottom-end': { side: 'bottom', align: 'end' },
  left: { side: 'left', align: 'center' },
  'left-start': { side: 'left', align: 'start' },
  'left-end': { side: 'left', align: 'end' },
};

export function parsePlacement(placement: Placement): { side: Side; align: Alignment | 'center' } {
  return PLACEMENTS[placement];
}
