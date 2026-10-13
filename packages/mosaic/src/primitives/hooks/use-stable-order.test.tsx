import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useStableOrder } from './use-stable-order';

interface Item {
  id: string;
  label?: string;
}

const byId = (item: Item) => item.id;

let latest: Item[];

function List({ items }: { items: Item[] }) {
  latest = useStableOrder(items, byId);
  return null;
}

describe('useStableOrder', () => {
  it('keeps the first order when items move', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} />);

    rerender(<List items={[{ id: 'c' }, { id: 'a' }, { id: 'b' }]} />);

    expect(latest.map(byId)).toEqual(['a', 'b', 'c']);
  });

  it('appends new items and drops removed ones', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);

    rerender(<List items={[{ id: 'd' }, { id: 'b' }]} />);
    expect(latest.map(byId)).toEqual(['b', 'd']);

    rerender(<List items={[{ id: 'a' }, { id: 'd' }, { id: 'b' }]} />);
    expect(latest.map(byId)).toEqual(['b', 'd', 'a']);
  });

  it('returns the latest data for each item', () => {
    const { rerender } = render(<List items={[{ id: 'a', label: 'one' }, { id: 'b' }]} />);

    rerender(<List items={[{ id: 'b' }, { id: 'a', label: 'uno' }]} />);

    expect(latest[0]).toEqual({ id: 'a', label: 'uno' });
  });

  it('returns the same array while nothing changed', () => {
    const items = [{ id: 'a' }];
    const { rerender } = render(<List items={items} />);
    const first = latest;

    rerender(<List items={items} />);

    expect(latest).toBe(first);
  });

  it('keeps a duplicated key once', () => {
    render(<List items={[{ id: 'a', label: 'one' }, { id: 'b' }, { id: 'a', label: 'two' }]} />);

    expect(latest).toEqual([{ id: 'a', label: 'one' }, { id: 'b' }]);
  });
});
