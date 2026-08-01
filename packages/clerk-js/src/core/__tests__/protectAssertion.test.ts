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

  // The whole reason a function is supported: the token outlives neither the page nor its own
  // expiry, so a value captured once at configuration time would silently stop applying.
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

  // An assertion may influence a sign-in but must never prevent one, so every bad input
  // degrades to "no assertion" rather than propagating.
  it.each([
    [
      'a throwing resolver',
      () => {
        throw new Error('boom');
      },
    ],
    ['a rejecting resolver', () => Promise.reject(new Error('boom'))],
  ])('never rejects for %s', async (_label, resolver) => {
    await expect(resolveProtectAssertion(resolver as () => string)).resolves.toBeUndefined();
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

  // The param name is a cross-repo contract with the server, and it is deliberately identical
  // to the cookie that can carry the same value. It is also all lower-case + underscores, so
  // the body's camelCase→snake_case encoder leaves it alone — pinned here because a rename
  // would break silently, as an ignored param rather than an error.
  it('uses a param name the body encoder cannot mangle', () => {
    expect(PROTECT_ASSERTION_PARAM).toBe('__clerk_protect_assertion');
    expect(PROTECT_ASSERTION_PARAM).toBe(PROTECT_ASSERTION_PARAM.toLowerCase());
    expect(PROTECT_ASSERTION_PARAM).not.toMatch(/[A-Z]/);
  });

  // Returning undefined rather than {} is what keeps a request with no assertion byte-for-byte
  // the request that would have been sent before this existed.
  it('returns undefined when there is nothing to attach', async () => {
    await expect(protectAssertionParams(undefined)).resolves.toBeUndefined();
    await expect(protectAssertionParams(() => undefined)).resolves.toBeUndefined();
    await expect(protectAssertionParams('')).resolves.toBeUndefined();
  });
});
