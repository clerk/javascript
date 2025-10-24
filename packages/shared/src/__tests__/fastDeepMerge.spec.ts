import { describe, expect, it } from 'vitest';

import { fastDeepMergeAndKeep, fastDeepMergeAndReplace } from '../utils/fastDeepMerge';

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
