import { afterEach, describe, expect, it } from 'vitest';

import { fastDeepMergeAndKeep, fastDeepMergeAndReplace } from '../utils/fastDeepMerge';

// Helper to clean up any accidental prototype pollution during tests
afterEach(() => {
  // @ts-expect-error - cleaning up potential pollution
  delete Object.prototype.polluted;
  // @ts-expect-error - cleaning up potential pollution
  delete Object.prototype.isAdmin;
});

describe('fastDeepMergeReplace', () => {
  it('merges simple objects', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = {};
    fastDeepMergeAndReplace(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('merges all keys when objects have different keys', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = { d: '4', e: '5', f: '6' };
    fastDeepMergeAndReplace(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' });
  });

  it('source overrides target when they have same keys', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = { a: '10' };
    fastDeepMergeAndReplace(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('source overrides target when they have same keys even for nested objects', () => {
    const source = { a: '1', b: '2', c: '3', obj: { a: '1', b: '2' } };
    const target = { a: '10', obj: { a: '10', b: '20' } };
    fastDeepMergeAndReplace(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3', obj: { a: '1', b: '2' } });
  });
});

describe('fastDeepMergeKeep', () => {
  it('merges simple objects', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = {};
    fastDeepMergeAndKeep(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('merges all keys when objects have different keys', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = { d: '4', e: '5', f: '6' };
    fastDeepMergeAndKeep(source, target);
    expect(target).toEqual({ a: '1', b: '2', c: '3', d: '4', e: '5', f: '6' });
  });

  it('source overrides target when they have same keys', () => {
    const source = { a: '1', b: '2', c: '3' };
    const target = { a: '10' };
    fastDeepMergeAndKeep(source, target);
    expect(target).toEqual({ a: '10', b: '2', c: '3' });
  });

  it('source overrides target when they have same keys even for nested objects', () => {
    const source = { a: '1', b: '2', c: '3', obj: { a: '1', b: '2' } };
    const target = { a: '10', obj: { a: '10', b: '20' } };
    fastDeepMergeAndKeep(source, target);
    expect(target).toEqual({ a: '10', b: '2', c: '3', obj: { a: '10', b: '20' } });
  });
});

describe('prototype pollution prevention', () => {
  describe('fastDeepMergeAndReplace', () => {
    it('should not pollute Object.prototype via __proto__', () => {
      const payload = JSON.parse('{"__proto__": {"polluted": "true"}}');
      const target = {};

      fastDeepMergeAndReplace(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
      // @ts-expect-error - checking for pollution
      expect({}.polluted).toBeUndefined();
    });

    it('should not pollute via constructor.prototype', () => {
      const payload = { constructor: { prototype: { isAdmin: true } } };
      const target = {};

      fastDeepMergeAndReplace(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.isAdmin).toBeUndefined();
      // @ts-expect-error - checking for pollution
      expect({}.isAdmin).toBeUndefined();
    });

    it('should not pollute via nested __proto__', () => {
      const payload = JSON.parse('{"nested": {"__proto__": {"polluted": "nested"}}}');
      const target = { nested: {} };

      fastDeepMergeAndReplace(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
    });

    it('should still merge safe keys normally', () => {
      const payload = JSON.parse('{"__proto__": {"polluted": "true"}, "safe": "value"}');
      const target = {};

      fastDeepMergeAndReplace(payload, target);

      expect(target).toEqual({ safe: 'value' });
      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
    });
  });

  describe('fastDeepMergeAndKeep', () => {
    it('should not pollute Object.prototype via __proto__', () => {
      const payload = JSON.parse('{"__proto__": {"polluted": "true"}}');
      const target = {};

      fastDeepMergeAndKeep(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
      // @ts-expect-error - checking for pollution
      expect({}.polluted).toBeUndefined();
    });

    it('should not pollute via constructor.prototype', () => {
      const payload = { constructor: { prototype: { isAdmin: true } } };
      const target = {};

      fastDeepMergeAndKeep(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.isAdmin).toBeUndefined();
      // @ts-expect-error - checking for pollution
      expect({}.isAdmin).toBeUndefined();
    });

    it('should not pollute via nested __proto__', () => {
      const payload = JSON.parse('{"nested": {"__proto__": {"polluted": "nested"}}}');
      const target = { nested: {} };

      fastDeepMergeAndKeep(payload, target);

      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
    });

    it('should still merge safe keys normally', () => {
      const payload = JSON.parse('{"__proto__": {"polluted": "true"}, "safe": "value"}');
      const target = {};

      fastDeepMergeAndKeep(payload, target);

      expect(target).toEqual({ safe: 'value' });
      // @ts-expect-error - checking for pollution
      expect(Object.prototype.polluted).toBeUndefined();
    });
  });
});
