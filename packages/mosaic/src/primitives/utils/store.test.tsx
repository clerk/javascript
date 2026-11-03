import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createStore, useStore } from './store';

describe('createStore', () => {
  it('notifies subscribers when the state changes', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    store.set({ count: 1 });

    expect(store.get()).toEqual({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify when set to the same state', () => {
    const state = { count: 0 };
    const store = createStore(state);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(state);

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(1);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('useStore', () => {
  it('re-renders only when the selected value changes', () => {
    const store = createStore({ active: 0, hovered: 0 });
    const renders = vi.fn();
    function Reader() {
      const isFirstActive = useStore(store, state => state.active === 1);
      renders();
      return <span>{isFirstActive ? 'active' : 'idle'}</span>;
    }
    render(<Reader />);
    renders.mockClear();

    act(() => store.set({ active: 0, hovered: 1 }));
    expect(renders).not.toHaveBeenCalled();

    act(() => store.set({ active: 1, hovered: 1 }));
    expect(renders).toHaveBeenCalledTimes(1);
    expect(screen.getByText('active')).toBeInTheDocument();
  });
});
