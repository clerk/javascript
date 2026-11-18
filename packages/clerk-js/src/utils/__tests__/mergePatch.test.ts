import { describe, expect, it } from 'vitest';

import { computeMergePatch } from '../mergePatch';

describe('computeMergePatch', () => {
  it('returns added keys verbatim', () => {
    expect(computeMergePatch({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 2 });
  });

  it('nulls keys absent from desired to delete them (RFC 7396)', () => {
    expect(computeMergePatch({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: null });
  });

  it('overwrites primitive values that changed', () => {
    expect(computeMergePatch({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it('skips keys whose value is unchanged', () => {
    expect(computeMergePatch({ a: 1, b: 2 }, { a: 1, b: 2 })).toEqual({});
  });

  it('recurses into nested objects, only emitting changed sub-keys', () => {
    expect(
      computeMergePatch({ profile: { theme: 'dark', font: 'sans' } }, { profile: { theme: 'light', font: 'sans' } }),
    ).toEqual({ profile: { theme: 'light' } });
  });

  it('nulls a removed nested key while keeping siblings untouched', () => {
    expect(computeMergePatch({ profile: { theme: 'dark', font: 'sans' } }, { profile: { font: 'sans' } })).toEqual({
      profile: { theme: null },
    });
  });

  it('returns full replacement of the desired side when shapes differ', () => {
    expect(computeMergePatch({ a: 1 }, 'replaced')).toBe('replaced');
    expect(computeMergePatch('was-string', { a: 1 })).toEqual({ a: 1 });
  });

  it('passes null through verbatim (caller decides what null means)', () => {
    expect(computeMergePatch({ a: 1 }, null)).toBeNull();
  });

  it('treats arrays as opaque values (replace, not merge)', () => {
    // RFC 7396 itself says arrays are atomic.
    expect(computeMergePatch({ tags: ['a', 'b'] }, { tags: ['a'] })).toEqual({ tags: ['a'] });
  });

  it('clears every existing key when desired is empty', () => {
    expect(computeMergePatch({ a: 1, b: 2 }, {})).toEqual({ a: null, b: null });
  });

  it('starts from empty current → returns desired verbatim', () => {
    expect(computeMergePatch({}, { a: 1, b: { c: 2 } })).toEqual({ a: 1, b: { c: 2 } });
  });

  it('when applied, the patch round-trips current → desired (sanity check)', () => {
    const current = { a: 1, nested: { x: 1, y: 2 }, removed: true };
    const desired = { a: 2, nested: { x: 1, z: 3 }, added: 'yes' };

    const patch = computeMergePatch(current, desired) as Record<string, unknown>;

    // Manually apply the patch with RFC 7396 semantics to confirm it produces
    // the desired state.
    const applyMergePatch = (target: any, p: any): any => {
      if (p === null || typeof p !== 'object' || Array.isArray(p)) {
        return p;
      }
      const out: Record<string, unknown> =
        typeof target === 'object' && target !== null && !Array.isArray(target) ? { ...target } : {};
      for (const key of Object.keys(p)) {
        const v = p[key];
        if (v === null) {
          delete out[key];
        } else {
          out[key] = applyMergePatch(out[key], v);
        }
      }
      return out;
    };

    expect(applyMergePatch(current, patch)).toEqual(desired);
  });

  describe('non-POJO values are treated as atomic', () => {
    it('emits a Date when the value changed', () => {
      const current = { lastSeen: new Date('2024-01-01T00:00:00Z') };
      const desired = { lastSeen: new Date('2024-01-02T00:00:00Z') };
      expect(computeMergePatch(current, desired)).toEqual({
        lastSeen: new Date('2024-01-02T00:00:00Z'),
      });
    });

    it('skips a Date whose value is unchanged', () => {
      const ts = '2024-01-01T00:00:00.000Z';
      expect(computeMergePatch({ lastSeen: new Date(ts) }, { lastSeen: new Date(ts) })).toEqual({});
    });

    it('emits a Map when the value changed', () => {
      const current = { tags: new Map([['a', 1]]) };
      const desired = { tags: new Map([['b', 2]]) };
      expect(computeMergePatch(current, desired)).toEqual({ tags: new Map([['b', 2]]) });
    });

    it('omits a Map when the value is unchanged', () => {
      const map = new Map([['a', 1]]);
      expect(computeMergePatch({ tags: map }, { tags: map })).toEqual({});
    });

    it('emits a class instance when the value changed', () => {
      class Tag {
        constructor(public name: string) {}
      }
      const current = { tag: new Tag('one') };
      const desired = { tag: new Tag('two') };
      expect(computeMergePatch(current, desired)).toEqual({ tag: new Tag('two') });
    });

    it('omits a class instance when the value is unchanged', () => {
      class Tag {
        constructor(public name: string) {}
      }
      const tag = new Tag('one');
      expect(computeMergePatch({ tag }, { tag })).toEqual({});
    });

    it('does not match Object.create(null) hash maps as opaque values', () => {
      // Prototype-less objects with no class identity SHOULD still recurse as POJOs.
      const current: Record<string, unknown> = Object.create(null);
      current.a = 1;
      current.b = 2;
      const desired: Record<string, unknown> = Object.create(null);
      desired.a = 1;
      expect(computeMergePatch(current, desired)).toEqual({ b: null });
    });
  });
});
