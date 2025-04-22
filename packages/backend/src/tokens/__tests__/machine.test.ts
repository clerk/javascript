import { describe, expect, it } from 'vitest';

import { API_KEY_PREFIX, getMachineTokenType, isMachineToken, M2M_TOKEN_PREFIX, OAUTH_TOKEN_PREFIX } from '../machine';

describe('isMachineToken', () => {
  it('returns true for tokens with M2M prefix', () => {
    expect(isMachineToken(`${M2M_TOKEN_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns true for tokens with OAuth prefix', () => {
    expect(isMachineToken(`${OAUTH_TOKEN_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns true for tokens with API key prefix', () => {
    expect(isMachineToken(`${API_KEY_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns false for tokens without a recognized prefix', () => {
    expect(isMachineToken('unknown_prefix_token')).toBe(false);
    expect(isMachineToken('session_token_value')).toBe(false);
    expect(isMachineToken('jwt_token_value')).toBe(false);
  });

  it('returns false for empty tokens', () => {
    expect(isMachineToken('')).toBe(false);
  });
});

describe('getMachineTokenType', () => {
  it('returns "machine_token" for tokens with M2M prefix', () => {
    expect(getMachineTokenType(`${M2M_TOKEN_PREFIX}some-token-value`)).toBe('machine_token');
  });

  it('returns "oauth_token" for tokens with OAuth prefix', () => {
    expect(getMachineTokenType(`${OAUTH_TOKEN_PREFIX}some-token-value`)).toBe('oauth_token');
  });

  it('returns "api_key" for tokens with API key prefix', () => {
    expect(getMachineTokenType(`${API_KEY_PREFIX}some-token-value`)).toBe('api_key');
  });

  it('throws an error for tokens without a recognized prefix', () => {
    expect(() => getMachineTokenType('unknown_prefix_token')).toThrow('Unknown machine token type');
  });

  it('throws an error for case-sensitive prefix mismatches', () => {
    expect(() => getMachineTokenType('M2M_token_value')).toThrow('Unknown machine token type');
    expect(() => getMachineTokenType('OAUTH_token_value')).toThrow('Unknown machine token type');
    expect(() => getMachineTokenType('API_KEY_value')).toThrow('Unknown machine token type');
  });

  it('throws an error for empty tokens', () => {
    expect(() => getMachineTokenType('')).toThrow('Unknown machine token type');
  });
});
