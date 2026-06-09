import { describe, expect, it } from 'vitest';

import { parseNativeOAuthCallback } from '../nativeOAuth';

describe('parseNativeOAuthCallback', () => {
  it('extracts the rotating_token_nonce from a successful custom-scheme callback', () => {
    const result = parseNativeOAuthCallback('myapp://sso-callback?rotating_token_nonce=abc123');
    expect(result).toEqual({ rotatingTokenNonce: 'abc123' });
  });

  it('surfaces an explicit error param, preferring error_description', () => {
    expect(parseNativeOAuthCallback('myapp://sso-callback?error=access_denied')).toEqual({ error: 'access_denied' });
    expect(parseNativeOAuthCallback('myapp://sso-callback?error=access_denied&error_description=User+said+no')).toEqual(
      { error: 'User said no' },
    );
  });

  it('returns an error when neither a nonce nor an error param is present', () => {
    const result = parseNativeOAuthCallback('myapp://sso-callback');
    expect(result.error).toBeTruthy();
    expect(result.rotatingTokenNonce).toBeUndefined();
  });

  it('returns an error when the callback URL is not parseable', () => {
    const result = parseNativeOAuthCallback('not a url');
    expect(result.error).toBeTruthy();
  });
});
