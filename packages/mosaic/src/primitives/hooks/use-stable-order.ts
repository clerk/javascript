'use client';

import { useMemo, useRef } from 'react';

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((key, index) => key === b[index]);
}

/**
 * Keeps items in the order they were first seen: a new item is appended, a removed item drops
 * out, and an item that moves in `items` stays where it was. The order given on the first
 * render is the one kept. A key that appears more than once is kept once.
 */
export function useStableOrder<T>(items: T[], getKey: (item: T) => string): T[] {
  const keys = Array.from(new Set(items.map(getKey)));
  const order = useRef<string[]>([]);
  const current = new Set(keys);
  const next = [...order.current.filter(key => current.has(key)), ...keys.filter(key => !order.current.includes(key))];
  if (!sameOrder(order.current, next)) {
    order.current = next;
  }
  const ordered = order.current;

  return useMemo(() => {
    const byKey = new Map<string, T>();
    for (const item of items) {
      const key = getKey(item);
      if (!byKey.has(key)) {
        byKey.set(key, item);
      }
    }
    return ordered.flatMap(key => {
      const item = byKey.get(key);
      return item === undefined ? [] : [item];
    });
  }, [items, getKey, ordered]);
}
