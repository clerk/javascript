import { describe, expect, test } from 'vitest';

import { getAuthSessionCallbackParam } from '../authSessionCallback';

describe('getAuthSessionCallbackParam', () => {
  test.each([
    ['a clean URL', 'myapp://sso-callback?rotating_token_nonce=abc123'],
    ['a literal trailing fragment', 'myapp://sso-callback?rotating_token_nonce=abc123#'],
    ['a Facebook-style fragment', 'myapp://sso-callback?rotating_token_nonce=abc123#_=_'],
    ['a percent-encoded trailing hash', 'myapp://sso-callback?rotating_token_nonce=abc123%23'],
    ['a percent-encoded hash with a suffix', 'myapp://sso-callback?rotating_token_nonce=abc123%23_=_'],
  ])('returns a clean value given %s', (_, url) => {
    expect(getAuthSessionCallbackParam(url, 'rotating_token_nonce')).toBe('abc123');
  });

  test('leaves params before a corrupted last param intact', () => {
    const url = 'myapp:?created_session_id=sess_1&rotating_token_nonce=abc123%23';
    expect(getAuthSessionCallbackParam(url, 'created_session_id')).toBe('sess_1');
    expect(getAuthSessionCallbackParam(url, 'rotating_token_nonce')).toBe('abc123');
  });

  test('returns null when the param is missing', () => {
    expect(
      getAuthSessionCallbackParam('myapp://sso-callback?created_session_id=sess_1', 'rotating_token_nonce'),
    ).toBeNull();
  });

  test('returns null for an unparsable URL', () => {
    expect(getAuthSessionCallbackParam('not a url', 'rotating_token_nonce')).toBeNull();
  });
});
