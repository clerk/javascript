import { describe, expect, it, vi } from 'vitest';

import { createTokenStore } from '../tokenStore';

describe('createTokenStore', () => {
  it('stores and retrieves values by key', () => {
    const store = createTokenStore<number>();
    store.set('a', 1);
    expect(store.get('a')).toBe(1);
  });

  it('returns undefined for a missing key', () => {
    const store = createTokenStore<number>();
    expect(store.get('missing')).toBeUndefined();
  });

  it('overwrites an existing key', () => {
    const store = createTokenStore<string>();
    store.set('k', 'first');
    store.set('k', 'second');
    expect(store.get('k')).toBe('second');
    expect(store.size()).toBe(1);
  });

  it('deletes a key', () => {
    const store = createTokenStore<number>();
    store.set('a', 1);
    store.delete('a');
    expect(store.get('a')).toBeUndefined();
    expect(store.size()).toBe(0);
  });

  it('treats delete on a missing key as a no-op', () => {
    const store = createTokenStore<number>();
    expect(() => store.delete('nope')).not.toThrow();
    expect(store.size()).toBe(0);
  });

  it('clears all entries', () => {
    const store = createTokenStore<number>();
    store.set('a', 1);
    store.set('b', 2);
    store.clear();
    expect(store.size()).toBe(0);
    expect(store.get('a')).toBeUndefined();
  });

  it('reports the number of entries', () => {
    const store = createTokenStore<number>();
    expect(store.size()).toBe(0);
    store.set('a', 1);
    store.set('b', 2);
    expect(store.size()).toBe(2);
  });

  it('iterates every entry with forEach', () => {
    const store = createTokenStore<number>();
    store.set('a', 1);
    store.set('b', 2);

    const seen = vi.fn();
    store.forEach(seen);

    expect(seen).toHaveBeenCalledTimes(2);
    expect(seen).toHaveBeenCalledWith(1, 'a');
    expect(seen).toHaveBeenCalledWith(2, 'b');
  });

  it('keeps reference identity for object values behind one generic interface', () => {
    const store = createTokenStore<{ raw: string }>();
    const value = { raw: 'token' };
    store.set('x', value);
    expect(store.get('x')).toBe(value);
  });
});
