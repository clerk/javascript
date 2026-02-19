import { describe, expect, it } from 'vitest';

import { createJwt, mockM2MJwtPayload, mockOAuthAccessTokenJwtPayload } from '../../fixtures';
import { mockSignedOAuthAccessTokenJwt, mockSignedOAuthAccessTokenJwtApplicationTyp } from '../../fixtures/machine';
import {
  API_KEY_PREFIX,
  getMachineTokenType,
  isJwtFormat,
  isMachineJwt,
  isMachineToken,
  isMachineTokenByPrefix,
  isMachineTokenType,
  isM2MJwt,
  isOAuthJwt,
  isTokenTypeAccepted,
  M2M_TOKEN_PREFIX,
  OAUTH_TOKEN_PREFIX,
} from '../machine';

describe('isMachineTokenByPrefix', () => {
  it('returns true for tokens with M2M prefix', () => {
    expect(isMachineTokenByPrefix(`${M2M_TOKEN_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns true for tokens with OAuth prefix', () => {
    expect(isMachineTokenByPrefix(`${OAUTH_TOKEN_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns true for tokens with API key prefix', () => {
    expect(isMachineTokenByPrefix(`${API_KEY_PREFIX}some-token-value`)).toBe(true);
  });

  it('returns false for tokens without a recognized prefix', () => {
    expect(isMachineTokenByPrefix('unknown_prefix_token')).toBe(false);
    expect(isMachineTokenByPrefix('session_token_value')).toBe(false);
    expect(isMachineTokenByPrefix('jwt_token_value')).toBe(false);
  });

  it('returns false for empty tokens', () => {
    expect(isMachineTokenByPrefix('')).toBe(false);
  });
});

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

  it('returns true for OAuth JWT with typ "at+jwt"', () => {
    expect(isMachineToken(mockSignedOAuthAccessTokenJwt)).toBe(true);
  });

  it('returns true for OAuth JWT with typ "application/at+jwt"', () => {
    expect(isMachineToken(mockSignedOAuthAccessTokenJwtApplicationTyp)).toBe(true);
  });

  it('returns true for OAuth JWT created with createJwt', () => {
    const token = createJwt({
      header: { typ: 'at+jwt', kid: 'ins_whatever' },
      payload: mockOAuthAccessTokenJwtPayload,
    });
    expect(isMachineToken(token)).toBe(true);
  });

  it('returns true for M2M JWT with mch_ subject', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(isMachineToken(token)).toBe(true);
  });

  it('returns false for tokens without a recognized prefix or OAuth JWT format', () => {
    expect(isMachineToken('unknown_prefix_token')).toBe(false);
    expect(isMachineToken('session_token_value')).toBe(false);
    expect(isMachineToken('jwt_token_value')).toBe(false);
  });

  it('returns false for regular JWT tokens (not machine JWT)', () => {
    const regularJwt = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: { ...mockOAuthAccessTokenJwtPayload, sub: 'user_123' },
    });
    expect(isMachineToken(regularJwt)).toBe(false);
  });

  it('returns false for empty tokens', () => {
    expect(isMachineToken('')).toBe(false);
  });
});

describe('getMachineTokenType', () => {
  it('returns "m2m_token" for tokens with M2M prefix', () => {
    expect(getMachineTokenType(`${M2M_TOKEN_PREFIX}some-token-value`)).toBe('m2m_token');
  });

  it('returns "oauth_token" for tokens with OAuth prefix', () => {
    expect(getMachineTokenType(`${OAUTH_TOKEN_PREFIX}some-token-value`)).toBe('oauth_token');
  });

  it('returns "oauth_token" for OAuth JWT with typ "at+jwt"', () => {
    expect(getMachineTokenType(mockSignedOAuthAccessTokenJwt)).toBe('oauth_token');
  });

  it('returns "oauth_token" for OAuth JWT with typ "application/at+jwt"', () => {
    expect(getMachineTokenType(mockSignedOAuthAccessTokenJwtApplicationTyp)).toBe('oauth_token');
  });

  it('returns "oauth_token" for OAuth JWT created with createJwt', () => {
    const token = createJwt({
      header: { typ: 'at+jwt', kid: 'ins_whatever' },
      payload: mockOAuthAccessTokenJwtPayload,
    });
    expect(getMachineTokenType(token)).toBe('oauth_token');
  });

  it('returns "m2m_token" for M2M JWT with mch_ subject', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(getMachineTokenType(token)).toBe('m2m_token');
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

describe('isTokenTypeAccepted', () => {
  it('accepts any token type', () => {
    expect(isTokenTypeAccepted('api_key', 'any')).toBe(true);
    expect(isTokenTypeAccepted('m2m_token', 'any')).toBe(true);
    expect(isTokenTypeAccepted('oauth_token', 'any')).toBe(true);
    expect(isTokenTypeAccepted('session_token', 'any')).toBe(true);
  });

  it('accepts a list of token types', () => {
    expect(isTokenTypeAccepted('api_key', ['api_key', 'm2m_token'])).toBe(true);
    expect(isTokenTypeAccepted('session_token', ['api_key', 'm2m_token'])).toBe(false);
  });

  it('rejects a mismatching token type', () => {
    expect(isTokenTypeAccepted('api_key', 'm2m_token')).toBe(false);
  });
});

describe('isMachineTokenType', () => {
  it('returns true for machine token types', () => {
    expect(isMachineTokenType('api_key')).toBe(true);
    expect(isMachineTokenType('m2m_token')).toBe(true);
    expect(isMachineTokenType('oauth_token')).toBe(true);
  });

  it('returns false for non-machine token types', () => {
    expect(isMachineTokenType('session_token')).toBe(false);
  });
});

describe('isJwtFormat', () => {
  it('returns true for valid JWT format', () => {
    expect(isJwtFormat('header.payload.signature')).toBe(true);
    expect(isJwtFormat('a.b.c')).toBe(true);
  });

  it('returns false for invalid JWT format', () => {
    expect(isJwtFormat('invalid')).toBe(false);
    expect(isJwtFormat('invalid.jwt')).toBe(false);
    expect(isJwtFormat('invalid.jwt.token.extra')).toBe(false);
  });
});

describe('isOAuthJwt', () => {
  it('returns true for JWT with typ "at+jwt"', () => {
    const token = createJwt({
      header: { typ: 'at+jwt', kid: 'ins_whatever' },
      payload: mockOAuthAccessTokenJwtPayload,
    });
    expect(isOAuthJwt(token)).toBe(true);
  });

  it('returns true for JWT with typ "application/at+jwt"', () => {
    const token = createJwt({
      header: { typ: 'application/at+jwt', kid: 'ins_whatever' },
      payload: mockOAuthAccessTokenJwtPayload,
    });
    expect(isOAuthJwt(token)).toBe(true);
  });

  it('returns false for JWT with other typ', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockOAuthAccessTokenJwtPayload,
    });
    expect(isOAuthJwt(token)).toBe(false);
  });

  it('returns false for non-JWT token', () => {
    expect(isOAuthJwt('not.a.jwt')).toBe(false);
  });
});

describe('isM2MJwt', () => {
  it('returns true for JWT with sub starting with mch_', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(isM2MJwt(token)).toBe(true);
  });

  it('returns false for OAuth JWT (different sub prefix)', () => {
    expect(isM2MJwt(mockSignedOAuthAccessTokenJwt)).toBe(false);
  });

  it('returns false for regular JWT without mch_ sub', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: { ...mockM2MJwtPayload, sub: 'user_123' },
    });
    expect(isM2MJwt(token)).toBe(false);
  });

  it('returns false for non-JWT token', () => {
    expect(isM2MJwt('mt_opaque_token')).toBe(false);
    expect(isM2MJwt('not.a.jwt')).toBe(false);
    expect(isM2MJwt('')).toBe(false);
  });
});

describe('isMachineJwt', () => {
  it('returns true for OAuth JWT', () => {
    expect(isMachineJwt(mockSignedOAuthAccessTokenJwt)).toBe(true);
  });

  it('returns true for M2M JWT', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: mockM2MJwtPayload,
    });
    expect(isMachineJwt(token)).toBe(true);
  });

  it('returns false for regular session JWT', () => {
    const token = createJwt({
      header: { typ: 'JWT', kid: 'ins_whatever' },
      payload: { sub: 'user_123', iat: 1666648250, exp: 1666648550 },
    });
    expect(isMachineJwt(token)).toBe(false);
  });

  it('returns false for opaque tokens', () => {
    expect(isMachineJwt('mt_opaque_token')).toBe(false);
    expect(isMachineJwt('oat_opaque_token')).toBe(false);
    expect(isMachineJwt('ak_opaque_token')).toBe(false);
  });
});
