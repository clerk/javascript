import { useSyncExternalStore } from 'react';

export interface Store<State> {
  get: () => State;
  set: (next: State) => void;
  subscribe: (listener: () => void) => () => void;
}

export function useStore<State, Selected>(store: Store<State>, selector: (state: State) => Selected): Selected {
  const getSelection = () => selector(store.get());
  return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}

export function createStore<State>(initial: State): Store<State> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      if (Object.is(next, state)) {
        return;
      }
      state = next;
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
