import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mergeRenderList, usePresenceList } from './use-presence-list';

interface Item {
  id: string;
  label?: string;
}

const byId = (item: Item) => item.id;

let latest: ReturnType<typeof usePresenceList<Item>>;

function List({ items }: { items: Item[] }) {
  latest = usePresenceList(items, byId);
  return null;
}

function ids() {
  return latest.map(entry => `${entry.key}${entry.present ? '' : '-'}`);
}

function exit(key: string) {
  act(() => latest.find(entry => entry.key === key)?.onExited());
}

describe('usePresenceList', () => {
  it('lists the given items as present', () => {
    render(<List items={[{ id: 'a' }, { id: 'b' }]} />);

    expect(ids()).toEqual(['a', 'b']);
  });

  it('keeps a removed item after its surviving predecessor until it has exited', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} />);

    rerender(<List items={[{ id: 'a' }, { id: 'c' }]} />);
    expect(ids()).toEqual(['a', 'b-', 'c']);

    exit('b');
    expect(ids()).toEqual(['a', 'c']);
  });

  it('renders a removed item with the data it last had', () => {
    const { rerender } = render(
      <List
        items={[
          { id: 'a', label: 'first' },
          { id: 'b', label: 'second' },
        ]}
      />,
    );

    rerender(<List items={[{ id: 'a', label: 'renamed' }]} />);

    expect(latest.map(entry => entry.item.label)).toEqual(['renamed', 'second']);
  });

  it('follows a removed item through later reorders and unrelated renders', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }, { id: 'c' }]} />);

    rerender(<List items={[{ id: 'a' }, { id: 'c' }]} />);
    rerender(<List items={[{ id: 'a' }, { id: 'c' }]} />);
    expect(ids()).toEqual(['a', 'b-', 'c']);

    rerender(<List items={[{ id: 'c' }, { id: 'a' }]} />);
    expect(ids()).toEqual(['c', 'a', 'b-']);
  });

  it('places a removed leading item first', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);

    rerender(<List items={[{ id: 'b' }, { id: 'c' }]} />);

    expect(ids()).toEqual(['a-', 'b', 'c']);
  });

  it('makes a returning item present again and ignores its stale exit', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);

    rerender(<List items={[{ id: 'a' }]} />);
    const stale = latest.find(entry => entry.key === 'b');
    rerender(<List items={[{ id: 'a' }, { id: 'b' }]} />);
    act(() => stale?.onExited());

    expect(ids()).toEqual(['a', 'b']);
  });

  it('keeps one onExited per key across renders', () => {
    const { rerender } = render(<List items={[{ id: 'a' }, { id: 'b' }]} />);
    const first = latest.find(entry => entry.key === 'b')?.onExited;

    rerender(<List items={[{ id: 'a' }]} />);

    expect(latest.find(entry => entry.key === 'b')?.onExited).toBe(first);
  });

  it('returns the same entries while nothing changed', () => {
    const items = [{ id: 'a' }];
    const { rerender } = render(<List items={items} />);
    const first = latest;

    rerender(<List items={items} />);

    expect(latest).toBe(first);
  });
});

describe('mergeRenderList', () => {
  it('anchors a missing key after its nearest surviving predecessor', () => {
    expect(mergeRenderList(['a', 'b', 'c', 'd'], ['a', 'd'])).toEqual(['a', 'b', 'c', 'd']);
    expect(mergeRenderList(['a', 'b'], ['c'])).toEqual(['a', 'b', 'c']);
    expect(mergeRenderList(['a', 'b', 'c'], ['c', 'a'])).toEqual(['c', 'a', 'b']);
  });
});
