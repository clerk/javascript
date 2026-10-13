'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PresenceEntry<T> {
  key: string;
  item: T;
  present: boolean;
  onExited: () => void;
}

interface PresenceState<T> {
  keys: string[];
  render: string[];
  held: ReadonlyMap<string, T>;
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((key, index) => key === b[index]);
}

export function mergeRenderList(previous: string[], current: string[]): string[] {
  const result = [...current];
  previous.forEach((key, index) => {
    if (result.includes(key)) {
      return;
    }
    const anchor = previous
      .slice(0, index)
      .reverse()
      .find(candidate => result.includes(candidate));
    result.splice(anchor === undefined ? 0 : result.indexOf(anchor) + 1, 0, key);
  });
  return result;
}

/**
 * Keeps an item that has left `items` in the returned entries, just after the nearest item that
 * preceded it and is still present, until its `onExited` is called. Drive each entry's
 * `useTransition` from `present` and call `onExited` once it unmounts, so a removed item plays
 * its exit before leaving the DOM. A removed item renders with the data it last had.
 */
export function usePresenceList<T>(items: T[], getKey: (item: T) => string) {
  const keys = useMemo(() => items.map(getKey), [items, getKey]);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const [state, setState] = useState<PresenceState<T>>(() => ({ keys, render: keys, held: new Map() }));
  const previous = useRef(items);
  useEffect(() => {
    previous.current = items;
  }, [items]);

  if (!sameOrder(state.keys, keys)) {
    const render = mergeRenderList(state.render, keys);
    const current = new Set(keys);
    const held = new Map<string, T>();
    for (const key of render) {
      if (!current.has(key)) {
        const item = state.held.get(key) ?? previous.current[state.keys.indexOf(key)];
        if (item !== undefined) {
          held.set(key, item);
        }
      }
    }
    setState({ keys, render: render.filter(key => current.has(key) || held.has(key)), held });
  }

  const callbacks = useRef(new Map<string, () => void>());
  const onExited = useCallback((key: string) => {
    let callback = callbacks.current.get(key);
    if (!callback) {
      callback = () => {
        if (keysRef.current.includes(key)) {
          return;
        }
        callbacks.current.delete(key);
        setState(current => {
          if (!current.render.includes(key)) {
            return current;
          }
          const held = new Map(current.held);
          held.delete(key);
          return { ...current, render: current.render.filter(candidate => candidate !== key), held };
        });
      };
      callbacks.current.set(key, callback);
    }
    return callback;
  }, []);

  return useMemo<PresenceEntry<T>[]>(() => {
    const byKey = new Map(items.map((item, index) => [keys[index], item]));
    return state.render.flatMap(key => {
      const item = byKey.get(key) ?? state.held.get(key);
      return item === undefined ? [] : [{ key, item, present: byKey.has(key), onExited: onExited(key) }];
    });
  }, [items, keys, state, onExited]);
}
