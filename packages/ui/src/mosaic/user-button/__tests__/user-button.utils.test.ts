import { describe, expect, it } from 'vitest';

import { applyOrder } from '../user-button.utils';

describe('applyOrder', () => {
  const id = (value: string) => value;

  it('keeps the default order when nothing is named', () => {
    expect(applyOrder(undefined, ['a', 'b', 'c'], id)).toEqual(['a', 'b', 'c']);
    expect(applyOrder([], ['a', 'b', 'c'], id)).toEqual(['a', 'b', 'c']);
  });

  it('leads with the named items, in the order they were named', () => {
    expect(applyOrder(['c', 'a'], ['a', 'b', 'c'], id)).toEqual(['c', 'a', 'b']);
  });

  it('drops names matching no item', () => {
    expect(applyOrder(['nope', 'b'], ['a', 'b'], id)).toEqual(['b', 'a']);
  });

  it('places an item named twice once', () => {
    expect(applyOrder(['b', 'b'], ['a', 'b'], id)).toEqual(['b', 'a']);
  });

  it('keeps the first of two items sharing an id, named or not', () => {
    const items = [
      { id: 'a', from: 'custom' },
      { id: 'a', from: 'built-in' },
      { id: 'b', from: 'built-in' },
    ];
    const byId = (item: { id: string }) => item.id;

    expect(applyOrder(undefined, items, byId)).toEqual([items[0], items[2]]);
    expect(applyOrder(['a'], items, byId)).toEqual([items[0], items[2]]);
  });
});
