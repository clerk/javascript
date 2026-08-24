import { describe, expect, it } from 'vitest';

import { createForm } from '../form';
import {
  clearFieldValues,
  insertFieldValue,
  moveFieldValues,
  pushFieldValue,
  removeFieldValue,
  replaceFieldValue,
  swapFieldValues,
} from './index';

function listForm() {
  return createForm({ defaultValues: { items: ['a', 'b', 'c'] } });
}

describe('array field operations', () => {
  it('appends, inserts and removes by index', () => {
    const form = listForm();
    pushFieldValue(form, 'items', 'd');
    expect(form.state.values.items).toEqual(['a', 'b', 'c', 'd']);
    insertFieldValue(form, 'items', 0, 'z');
    expect(form.state.values.items).toEqual(['z', 'a', 'b', 'c', 'd']);
    removeFieldValue(form, 'items', 1);
    expect(form.state.values.items).toEqual(['z', 'b', 'c', 'd']);
  });

  it('inserts at the end of the array', () => {
    const form = listForm();
    insertFieldValue(form, 'items', 3, 'd');
    expect(form.state.values.items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('swaps and moves items', () => {
    const form = listForm();
    swapFieldValues(form, 'items', 0, 2);
    expect(form.state.values.items).toEqual(['c', 'b', 'a']);
    moveFieldValues(form, 'items', 2, 0);
    expect(form.state.values.items).toEqual(['a', 'c', 'b']);
  });
});

describe('array index validation', () => {
  it('rejects an out-of-range replace instead of creating a sparse array', () => {
    const form = listForm();
    expect(() => replaceFieldValue(form, 'items', 5, 'x')).toThrow(RangeError);
    expect(form.state.values.items).toEqual(['a', 'b', 'c']);
  });

  it('rejects an out-of-range swap instead of writing undefined', () => {
    const form = listForm();
    expect(() => swapFieldValues(form, 'items', 0, 9)).toThrow(RangeError);
    expect(form.state.values.items).toEqual(['a', 'b', 'c']);
  });

  it('rejects an out-of-range move instead of inserting undefined', () => {
    const form = listForm();
    expect(() => moveFieldValues(form, 'items', 9, 0)).toThrow(RangeError);
    expect(() => moveFieldValues(form, 'items', 0, 9)).toThrow(RangeError);
    expect(form.state.values.items).toEqual(['a', 'b', 'c']);
  });

  it('rejects an out-of-range insert or remove', () => {
    const form = listForm();
    expect(() => insertFieldValue(form, 'items', 4, 'x')).toThrow(RangeError);
    expect(() => removeFieldValue(form, 'items', 3)).toThrow(RangeError);
    expect(form.state.values.items).toEqual(['a', 'b', 'c']);
  });

  it('rejects a non-integer index', () => {
    const form = listForm();
    expect(() => replaceFieldValue(form, 'items', 1.5, 'x')).toThrow(RangeError);
    expect(() => removeFieldValue(form, 'items', Number.NaN)).toThrow(RangeError);
    expect(() => removeFieldValue(form, 'items', -1)).toThrow(RangeError);
  });

  it('rejects any index on an empty array', () => {
    const form = createForm({ defaultValues: { items: [] as string[] } });
    expect(() => removeFieldValue(form, 'items', 0)).toThrow(RangeError);
  });
});

describe('array operations on non-array fields', () => {
  it('rejects a field holding a scalar instead of overwriting it', () => {
    const form = createForm({ defaultValues: { age: 30 } });
    // @ts-expect-error 'age' is not an array field; the runtime guard covers JS callers.
    expect(() => pushFieldValue(form, 'age', 1)).toThrow(TypeError);
    expect(form.state.values.age).toBe(30);
  });

  it('rejects a field holding an object instead of overwriting it', () => {
    const form = createForm({ defaultValues: { user: { name: 'bob' } } });
    // @ts-expect-error 'user' is not an array field; the runtime guard covers JS callers.
    expect(() => clearFieldValues(form, 'user')).toThrow(TypeError);
    expect(form.state.values.user).toEqual({ name: 'bob' });
  });

  it('treats an absent field as an empty array', () => {
    const form = createForm<{ items?: string[] }>({ defaultValues: {} });
    pushFieldValue(form, 'items', 'a');
    expect(form.state.values.items).toEqual(['a']);
  });
});
