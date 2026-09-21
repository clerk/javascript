import type { JwtPayload } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdPOAuthAccessToken } from '../IdPOAuthAccessToken';
import type { IdPOAuthAccessTokenJSON } from '../JSON';

const basePayload = {
  iss: 'https://clerk.oauth.example.test',
  sub: 'user_2vYVtestTESTtestTESTtestTESTtest',
  client_id: 'client_2VTWUzvGC5UhdJCNx6xG1D98edc',
  scope: 'read:foo write:bar',
  jti: 'oat_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE',
  exp: 1666648550,
  iat: 1666648250,
  nbf: 1666648240,
};

const asPayload = (claims: Record<string, unknown>) => ({ ...basePayload, ...claims }) as unknown as JwtPayload;

const baseJSON: IdPOAuthAccessTokenJSON = {
  object: 'clerk_idp_oauth_access_token',
  id: 'oat_2VTWUzvGC5UhdJCNx6xG1D98edc',
  client_id: 'client_2VTWUzvGC5UhdJCNx6xG1D98edc',
  type: 'oauth:access_token',
  subject: 'user_2vYVtestTESTtestTESTtestTESTtest',
  scopes: ['read:foo', 'write:bar'],
  revoked: false,
  revocation_reason: null,
  expired: false,
  expiration: null,
  created_at: 1744928754551,
  updated_at: 1744928754551,
};

describe('IdPOAuthAccessToken', () => {
  describe('fromJwtPayload', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(basePayload.iat * 1000));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('maps the OAuth claims', () => {
      const token = IdPOAuthAccessToken.fromJwtPayload(asPayload({}));

      expect(token.id).toBe('oat_2xKa9Bgv7NxMRDFyQw8LpZ3cTmU1vHjE');
      expect(token.clientId).toBe('client_2VTWUzvGC5UhdJCNx6xG1D98edc');
      expect(token.subject).toBe('user_2vYVtestTESTtestTESTtestTESTtest');
      expect(token.scopes).toEqual(['read:foo', 'write:bar']);
      expect(token.aud).toEqual([]);
      expect(token.act).toBeNull();
    });

    it('normalizes a string aud claim to a list', () => {
      const token = IdPOAuthAccessToken.fromJwtPayload(asPayload({ aud: 'https://mcp.example.test/mcp' }));

      expect(token.aud).toEqual(['https://mcp.example.test/mcp']);
    });

    it('keeps an array aud claim', () => {
      const aud = ['https://mcp.example.test/mcp', 'https://api.example.test'];
      const token = IdPOAuthAccessToken.fromJwtPayload(asPayload({ aud }));

      expect(token.aud).toEqual(aud);
    });

    it('drops non-string aud entries', () => {
      const token = IdPOAuthAccessToken.fromJwtPayload(
        asPayload({ aud: ['https://mcp.example.test/mcp', 42, '', null] }),
      );

      expect(token.aud).toEqual(['https://mcp.example.test/mcp']);
    });

    it('exposes the act claim', () => {
      const act = { sub: 'client_2agentTESTtestTESTtestTESTtest' };
      const token = IdPOAuthAccessToken.fromJwtPayload(asPayload({ act }));

      expect(token.act).toEqual(act);
    });
  });

  describe('fromJSON', () => {
    it('defaults aud and act when the API omits them', () => {
      const token = IdPOAuthAccessToken.fromJSON(baseJSON);

      expect(token.aud).toEqual([]);
      expect(token.act).toBeNull();
    });

    it('maps aud and act from the API response', () => {
      const act = { sub: 'client_2agentTESTtestTESTtestTESTtest' };
      const token = IdPOAuthAccessToken.fromJSON({ ...baseJSON, aud: ['https://mcp.example.test/mcp'], act });

      expect(token.aud).toEqual(['https://mcp.example.test/mcp']);
      expect(token.act).toEqual(act);
    });
  });
});
