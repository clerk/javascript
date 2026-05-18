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
});
