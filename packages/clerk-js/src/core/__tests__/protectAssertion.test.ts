import { describe, expect, it, vi } from 'vitest';

import { PROTECT_ASSERTION_PARAM, protectAssertionParams, resolveProtectAssertion } from '../protectAssertion';

describe('resolveProtectAssertion', () => {
  it('returns undefined when nothing is configured', async () => {
    await expect(resolveProtectAssertion(undefined)).resolves.toBeUndefined();
  });

  it('returns a configured string as-is', async () => {
    await expect(resolveProtectAssertion('token-abc')).resolves.toBe('token-abc');
  });

  it('calls a sync resolver', async () => {
    await expect(resolveProtectAssertion(() => 'token-sync')).resolves.toBe('token-sync');
  });

  it('awaits an async resolver', async () => {
    await expect(resolveProtectAssertion(() => Promise.resolve('token-async'))).resolves.toBe('token-async');
  });

  it('re-reads the resolver on every call', async () => {
    const resolver = vi.fn<() => string>();
    resolver.mockReturnValueOnce('first').mockReturnValueOnce('second');

    await expect(resolveProtectAssertion(resolver)).resolves.toBe('first');
    await expect(resolveProtectAssertion(resolver)).resolves.toBe('second');
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('treats a resolver returning undefined as "no assertion right now"', async () => {
    await expect(resolveProtectAssertion(() => undefined)).resolves.toBeUndefined();
  });

  // Bad inputs degrade to "no assertion" rather than propagating; Protect must never fail a sign-in.
  it.each([
    [
      'a throwing resolver',
      () => {
        throw new Error('boom');
      },
    ],
    ['a rejecting resolver', () => Promise.reject(new Error('boom'))],
  ])('never rejects for %s', async (_label, resolver) => {
    await expect(resolveProtectAssertion(resolver as unknown as () => string)).resolves.toBeUndefined();
  });

  it.each([
    ['an empty string', ''],
    ['whitespace only', '   '],
    ['a number', 42],
    ['null', null],
    ['an object', { token: 'x' }],
  ])('ignores %s', async (_label, value) => {
    await expect(resolveProtectAssertion(() => value as unknown as string)).resolves.toBeUndefined();
  });
});

describe('protectAssertionParams', () => {
  it('names the param the server expects', async () => {
    await expect(protectAssertionParams('token-abc')).resolves.toEqual({
      [PROTECT_ASSERTION_PARAM]: 'token-abc',
    });
  });

  // The param name is a cross-repo contract with the server; a rename would break silently.
  it('uses a param name the body encoder cannot mangle', () => {
    expect(PROTECT_ASSERTION_PARAM).toBe('__clerk_protect_assertion');
    expect(PROTECT_ASSERTION_PARAM).toBe(PROTECT_ASSERTION_PARAM.toLowerCase());
    expect(PROTECT_ASSERTION_PARAM).not.toMatch(/[A-Z]/);
  });

  it('returns undefined when there is nothing to attach', async () => {
    await expect(protectAssertionParams(undefined)).resolves.toBeUndefined();
    await expect(protectAssertionParams(() => undefined)).resolves.toBeUndefined();
    await expect(protectAssertionParams('')).resolves.toBeUndefined();
  });
});
