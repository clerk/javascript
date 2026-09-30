import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useReorderKeys } from './use-reorder-keys';

interface Item {
  id: string;
  anchor?: boolean;
}

const byId = (item: Item) => item.id;
const isAnchor = (item: Item) => item.anchor === true;

let latest: ReturnType<typeof useReorderKeys<Item>>;

function List({ items, anchored = false }: { items: Item[]; anchored?: boolean }) {
  latest = useReorderKeys(items, byId, anchored ? isAnchor : undefined);
  return null;
}

const keys = () => latest.map(entry => entry.key);

describe('useReorderKeys', () => {
  it('keys items by id while the order holds', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);
    expect(keys()).toEqual(['a', 'b']);

    rerender(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} />);
    expect(keys()).toEqual(['a', 'b', 'c']);

    rerender(<List items={[{ id: 'a' }, { id: 'c' }]} />);
    expect(keys()).toEqual(['a', 'c']);
  });

  it('re-keys only the item that moved', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]} />);

    rerender(<List items={[{ id: 'd' }, { id: 'a' }, { id: 'b' }, { id: 'c' }]} />);
    expect(keys()).toEqual(['d#1', 'a', 'b', 'c']);

    rerender(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]} />);
    expect(keys()).toEqual(['a', 'b', 'c', 'd#2']);
  });

  it('re-keys a swap on one side only', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);

    rerender(<List items={[{ id: 'b' }, { id: 'a' }]} />);

    expect(keys().filter(key => key.includes('#'))).toHaveLength(1);
  });

  it('keeps an anchored item and moves the items it passes', () => {
    const { rerender } = render(
      <List
        items={[{ id: 'a', anchor: true }, { id: 'b' }, { id: 'c' }, { id: 'd' }]}
        anchored
      />,
    );

    rerender(
      <List
        items={[{ id: 'd', anchor: true }, { id: 'a' }, { id: 'b' }, { id: 'c' }]}
        anchored
      />,
    );
    expect(keys()).toEqual(['d', 'a#1', 'b#1', 'c#1']);

    rerender(
      <List
        items={[{ id: 'd', anchor: true }, { id: 'a' }, { id: 'c' }]}
        anchored
      />,
    );
    expect(keys()).toEqual(['d', 'a#1', 'c#1']);
  });
});
