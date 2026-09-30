'use client';

import { useMemo, useRef } from 'react';

export interface KeyedItem<T> {
  key: string;
  item: T;
}

function longestCommonSubsequence(a: string[], b: string[]): Set<string> {
  const table: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const kept = new Set<string>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      kept.add(a[i]);
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return kept;
}

function keptIds(previous: string[], current: string[], anchor: string | undefined): Set<string> {
  const from = anchor === undefined ? -1 : previous.indexOf(anchor);
  const to = anchor === undefined ? -1 : current.indexOf(anchor);
  if (anchor === undefined || from === -1 || to === -1) {
    return longestCommonSubsequence(previous, current);
  }
  return new Set([
    anchor,
    ...longestCommonSubsequence(previous.slice(0, from), current.slice(0, to)),
    ...longestCommonSubsequence(previous.slice(from + 1), current.slice(to + 1)),
  ]);
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Keys each item by its id plus a generation that advances whenever the item changes position
 * relative to the items around it. Rendered under those keys, a reordered item leaves as one
 * element and arrives as another, so an enter/exit transition plays at both of its positions
 * while items that kept their order keep their elements. Only the items outside the longest
 * common subsequence of the previous and current order are counted as moved. An item matched by
 * `isAnchor` always keeps its element: the subsequence is taken on each side of it, so the items
 * it passes are the ones that move.
 */
export function useReorderKeys<T>(
  items: T[],
  getId: (item: T) => string,
  isAnchor?: (item: T) => boolean,
): KeyedItem<T>[] {
  const ids = items.map(getId);
  const anchorItem = isAnchor ? items.find(isAnchor) : undefined;
  const anchor = anchorItem === undefined ? undefined : getId(anchorItem);
  const tracked = useRef<{ ids: string[]; generations: ReadonlyMap<string, number> } | null>(null);

  if (tracked.current === null) {
    tracked.current = { ids, generations: new Map() };
  } else if (!sameOrder(tracked.current.ids, ids)) {
    const kept = keptIds(tracked.current.ids, ids, anchor);
    const previous = new Set(tracked.current.ids);
    const generations = new Map(tracked.current.generations);
    for (const id of ids) {
      if (previous.has(id) && !kept.has(id)) {
        generations.set(id, (generations.get(id) ?? 0) + 1);
      }
    }
    tracked.current = { ids, generations };
  }

  const { generations } = tracked.current;
  return useMemo(
    () =>
      items.map(item => {
        const id = getId(item);
        const generation = generations.get(id) ?? 0;
        return { key: generation === 0 ? id : `${id}#${generation}`, item };
      }),
    [items, getId, generations],
  );
}
