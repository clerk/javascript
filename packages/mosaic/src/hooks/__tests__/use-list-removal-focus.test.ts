import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useListRemovalFocus } from '../use-list-removal-focus';

function setup(
  ids: string[],
  onRemove: ((id: string) => void | Promise<void>) | undefined,
  registered: string[] = ids,
) {
  const fallback = document.createElement('div');
  const buttons = new Map(registered.map(id => [id, document.createElement('button')]));
  const hook = renderHook(props => useListRemovalFocus({ ids: props.ids, onRemove, fallback: () => fallback }), {
    initialProps: { ids },
  });
  for (const [id, button] of buttons) {
    hook.result.current.registerTrigger(id)(button);
  }
  const remove = (id: string) => act(() => hook.result.current.remove(id));
  return { ...hook, buttons, fallback, remove };
}

describe('useListRemovalFocus', () => {
  it.each([
    ['the first row', 'a', 'b'],
    ['a middle row', 'b', 'c'],
    ['the last row', 'c', 'b'],
  ])('after removing %s, targets the row that takes its place', async (_label, removed, expected) => {
    const { result, buttons, remove } = setup(['a', 'b', 'c'], vi.fn());

    await remove(removed);

    expect(result.current.finalFocus()).toBe(buttons.get(expected));
  });

  it('targets the fallback once the last row is removed', async () => {
    const { result, fallback, remove } = setup(['a'], vi.fn());

    await remove('a');

    expect(result.current.finalFocus()).toBe(fallback);
  });

  it('targets the fallback when the next row has no trigger', async () => {
    const { result, fallback, remove } = setup(['a', 'b'], vi.fn(), ['a']);

    await remove('a');

    expect(result.current.finalFocus()).toBe(fallback);
  });

  it('keeps the removed position when the list updates before focus is restored', async () => {
    const { result, buttons, remove, rerender } = setup(['a', 'b', 'c'], vi.fn());

    await remove('b');
    rerender({ ids: ['a', 'c'] });

    expect(result.current.finalFocus()).toBe(buttons.get('c'));
  });

  it('targets nothing when no row was removed, so a cancelled confirmation keeps its default', () => {
    const { result } = setup(['a', 'b'], vi.fn());

    expect(result.current.finalFocus()).toBeNull();
  });

  it('targets the replacement row only once per removal', async () => {
    const { result, buttons, remove } = setup(['a', 'b'], vi.fn());

    await remove('a');

    expect(result.current.finalFocus()).toBe(buttons.get('b'));
    expect(result.current.finalFocus()).toBeNull();
  });

  it('records nothing when the removal fails', async () => {
    const { result, remove } = setup(['a', 'b'], () => Promise.reject(new Error('failed')));

    await expect(remove('a')).rejects.toThrow('failed');

    expect(result.current.finalFocus()).toBeNull();
  });

  it('does nothing without a removal handler', async () => {
    const { result, remove } = setup(['a', 'b'], undefined);

    await remove('a');

    expect(result.current.finalFocus()).toBeNull();
  });
});
