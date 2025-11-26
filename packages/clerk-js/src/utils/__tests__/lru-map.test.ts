import { describe, expect, it } from 'vitest';

import { LruMap } from '../lru-map';

describe('LruMap', () => {
  it('stores and retrieves values', () => {
    const map = new LruMap<string, number>(3);
    map.set('a', 1);
    map.set('b', 2);

    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBeUndefined();
  });

  it('evicts oldest entry when exceeding max size', () => {
    const map = new LruMap<string, number>(3);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);
    map.set('d', 4);

    expect(map.get('a')).toBeUndefined();
    expect(map.get('b')).toBe(2);
    expect(map.get('c')).toBe(3);
    expect(map.get('d')).toBe(4);
    expect(map.size).toBe(3);
  });

  it('moves accessed entry to most recent position', () => {
    const map = new LruMap<string, number>(3);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);

    map.get('a');

    map.set('d', 4);

    expect(map.get('a')).toBe(1);
    expect(map.get('b')).toBeUndefined();
    expect(map.get('c')).toBe(3);
    expect(map.get('d')).toBe(4);
  });

  it('updates existing entry without eviction', () => {
    const map = new LruMap<string, number>(3);
    map.set('a', 1);
    map.set('b', 2);
    map.set('c', 3);

    map.set('a', 100);

    expect(map.get('a')).toBe(100);
    expect(map.size).toBe(3);

    map.set('d', 4);

    expect(map.get('a')).toBe(100);
    expect(map.get('b')).toBeUndefined();
    expect(map.size).toBe(3);
  });

  it('handles max size of 1', () => {
    const map = new LruMap<string, number>(1);
    map.set('a', 1);
    map.set('b', 2);

    expect(map.get('a')).toBeUndefined();
    expect(map.get('b')).toBe(2);
    expect(map.size).toBe(1);
  });
});
