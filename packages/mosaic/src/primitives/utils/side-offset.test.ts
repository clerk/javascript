import { describe, expect, it } from 'vitest';

import { parsePlacement, resolveSideOffset } from './side-offset';

describe('resolveSideOffset', () => {
  it('takes one number for every placement', () => {
    expect(resolveSideOffset(8, 'top-start')).toBe(8);
    expect(resolveSideOffset(8, 'right')).toBe(8);
  });

  it('takes x on a horizontal placement and y on a vertical one', () => {
    const offset = { x: 16, y: 8 };

    expect(resolveSideOffset(offset, 'right-start')).toBe(16);
    expect(resolveSideOffset(offset, 'left-end')).toBe(16);
    expect(resolveSideOffset(offset, 'top-start')).toBe(8);
    expect(resolveSideOffset(offset, 'bottom')).toBe(8);
  });
});

describe('parsePlacement', () => {
  it.each([
    ['top', { side: 'top', align: 'center' }],
    ['bottom-start', { side: 'bottom', align: 'start' }],
    ['left-end', { side: 'left', align: 'end' }],
    ['right', { side: 'right', align: 'center' }],
  ] as const)('splits %s', (placement, expected) => {
    expect(parsePlacement(placement)).toEqual(expected);
  });
});
