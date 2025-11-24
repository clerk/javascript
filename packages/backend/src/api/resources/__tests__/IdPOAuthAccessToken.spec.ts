import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdPOAuthAccessToken } from '../IdPOAuthAccessToken';

describe('IdPOAuthAccessToken.fromJwtPayload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates IdPOAuthAccessToken from JWT payload with space-delimited scope', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      scope: 'read:profile write:data',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
      iat: Math.floor(Date.now() / 1000),
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.id).toBe('oat_1234567890abcdef');
    expect(token.clientId).toBe('client_abc123');
    expect(token.type).toBe('oauth_access_token');
    expect(token.subject).toBe('user_xyz789');
    expect(token.scopes).toEqual(['read:profile', 'write:data']);
    expect(token.revoked).toBe(false);
    expect(token.revocationReason).toBeNull();
    expect(token.expired).toBe(false);
    expect(token.expiration).toBe(payload.exp);
    expect(token.createdAt).toBe(payload.iat);
    expect(token.updatedAt).toBe(payload.iat);
  });

  it('creates IdPOAuthAccessToken from JWT payload with scp array', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      scp: ['read:profile', 'write:data'],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.scopes).toEqual(['read:profile', 'write:data']);
  });

  it('prefers scp array over scope string', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      scope: 'should:not:use',
      scp: ['should:use'],
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.scopes).toEqual(['should:use']);
  });

  it('creates empty scopes array when no scope or scp', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.scopes).toEqual([]);
  });

  it('marks token as expired when exp is in the past', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
      iat: Math.floor(Date.now() / 1000) - 7200,
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.expired).toBe(true);
  });

  it('marks token as not expired when within clock skew', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      exp: Math.floor(Date.now() / 1000) - 2, // 2 seconds in the past
      iat: Math.floor(Date.now() / 1000) - 10,
    };

    // Default clock skew is 5000ms (5 seconds)
    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.expired).toBe(false);
  });

  it('uses custom clock skew for expiration calculation', () => {
    const payload = {
      jti: 'oat_1234567890abcdef',
      client_id: 'client_abc123',
      sub: 'user_xyz789',
      exp: Math.floor(Date.now() / 1000) - 2, // 2 seconds in the past
      iat: Math.floor(Date.now() / 1000) - 10,
    };

    // With 1 second clock skew, token should be expired
    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any, 1000);

    expect(token.expired).toBe(true);
  });

  it('handles missing optional fields gracefully', () => {
    const payload = {
      sub: 'user_xyz789',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = IdPOAuthAccessToken.fromJwtPayload(payload as any);

    expect(token.id).toBe('');
    expect(token.clientId).toBe('');
    expect(token.createdAt).toBe(0);
    expect(token.updatedAt).toBe(0);
  });
});
