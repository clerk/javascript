import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { handle } from '../../server';
import type { Identity } from '../../types';
import {
  bearerRequest,
  type IntegrationFixtures,
  provisionFixtures,
  skipWhenNoSecret,
  teardownFixtures,
} from './setup';

describe.skipIf(skipWhenNoSecret)('cli-auth server integration', () => {
  let fx: IntegrationFixtures;

  beforeAll(async () => {
    fx = await provisionFixtures();
  });

  afterAll(async () => {
    await teardownFixtures(fx);
  });

  describe('auth.verifyToken', () => {
    it('verifies an API key, returns TokenInfo with type=api_key + correct subject', async () => {
      const secret = fx.apiKey.secret;
      expect(secret).toBeTypeOf('string');
      const info = await fx.auth.verifyToken(secret!);
      expect(info.type).toBe('api_key');
      expect(info.subject).toBe(fx.user.id);
      expect(info.scopes).toEqual(expect.arrayContaining(['cli:read']));
    });

    it('verifies an opaque M2M token, type=m2m_token, subject mch_*', async () => {
      const token = fx.m2mTokenOpaque.token;
      expect(token).toBeTypeOf('string');
      expect(token!.startsWith('mt_')).toBe(true);
      const info = await fx.auth.verifyToken(token!);
      expect(info.type).toBe('m2m_token');
      expect(info.subject).toMatch(/^mch_/);
    });

    it('verifies a JWT-shaped M2M token, type=m2m_token', async () => {
      const token = fx.m2mTokenJwt.token;
      expect(token).toBeTypeOf('string');
      expect(token!.split('.').length).toBe(3);
      const info = await fx.auth.verifyToken(token!);
      expect(info.type).toBe('m2m_token');
      expect(info.subject).toMatch(/^mch_/);
    });

    it('rejects when accepts gates out the verified type', async () => {
      // M2M sent to an api_key-only verifier.
      await expect(fx.auth.verifyToken(fx.m2mTokenOpaque.token!, { accepts: 'api_key' })).rejects.toThrow(
        /not accepted/i,
      );
    });

    it('throws on an unrecognized token', async () => {
      await expect(fx.auth.verifyToken('not-a-real-token')).rejects.toThrow();
    });
  });

  describe('auth.verifyTokenFromRequest', () => {
    it('reads the Bearer header and verifies', async () => {
      const req = bearerRequest(fx.apiKey.secret!);
      const info = await fx.auth.verifyTokenFromRequest(req, { accepts: 'api_key' });
      expect(info.subject).toBe(fx.user.id);
      expect(info.type).toBe('api_key');
    });

    it('throws on a missing Authorization header', async () => {
      const req = new Request('http://test.local/cli');
      await expect(fx.auth.verifyTokenFromRequest(req)).rejects.toThrow(/Authorization/);
    });

    it('throws on an unaccepted type', async () => {
      const req = bearerRequest(fx.m2mTokenOpaque.token!);
      await expect(fx.auth.verifyTokenFromRequest(req, { accepts: 'api_key' })).rejects.toThrow(/not accepted/i);
    });
  });

  describe('auth.resolveAuthInfo (default)', () => {
    it('projects subject + claims into Identity', async () => {
      const info = await fx.auth.verifyToken(fx.apiKey.secret!);
      const identity = await fx.auth.resolveAuthInfo({ tokenInfo: info, request: bearerRequest(fx.apiKey.secret!) });
      expect(identity.sub).toBe(fx.user.id);
    });
  });

  describe('handle() end-to-end', () => {
    it('200 with Identity body when a valid API key is sent', async () => {
      const route = handle({ auth: fx.auth, accepts: 'api_key' });
      const res = await route(bearerRequest(fx.apiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.user.id);
    });

    it('200 with mch_ subject when a valid M2M token is sent', async () => {
      const route = handle({ auth: fx.auth, accepts: 'm2m_token' });
      const res = await route(bearerRequest(fx.m2mTokenOpaque.token!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toMatch(/^mch_/);
    });

    it('401 when an M2M token hits an api_key-only route', async () => {
      const route = handle({ auth: fx.auth, accepts: 'api_key' });
      const res = await route(bearerRequest(fx.m2mTokenOpaque.token!));
      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('not_authenticated');
    });

    it('401 when no Authorization header is present', async () => {
      const route = handle({ auth: fx.auth, accepts: 'any' });
      const res = await route(new Request('http://test.local/cli'));
      expect(res.status).toBe(401);
    });

    it('honors a custom resolveAuthInfo override', async () => {
      const route = handle({
        auth: fx.auth,
        accepts: 'api_key',
        resolveAuthInfo: ({ tokenInfo }) => ({
          sub: tokenInfo.subject,
          custom_field: 'enriched',
        }),
      });
      const res = await route(bearerRequest(fx.apiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity & { custom_field?: string };
      expect(body.sub).toBe(fx.user.id);
      expect(body.custom_field).toBe('enriched');
    });

    it('honors a custom verifyToken override', async () => {
      const route = handle({
        auth: fx.auth,
        accepts: 'api_key',
        verifyToken: async ({ token, type, clerk }) => {
          // Replace the verifier with our own — still using the bound `clerk` to keep this
          // real. Asserts the override path correctly receives token + auto-detected type.
          expect(type).toBe('api_key');
          const verified = await clerk.apiKeys.verify(token);
          return { subject: verified.subject, type, scopes: verified.scopes };
        },
      });
      const res = await route(bearerRequest(fx.apiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.user.id);
    });
  });
});
