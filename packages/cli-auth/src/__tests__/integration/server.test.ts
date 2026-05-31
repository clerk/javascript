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

  describe('auth.verifyToken — API key per subject kind', () => {
    it('verifies a user-scoped API key (subject = user_*)', async () => {
      const info = await fx.auth.verifyToken(fx.userApiKey.secret!);
      expect(info.type).toBe('api_key');
      expect(info.subject).toBe(fx.user.id);
      expect(info.subject).toMatch(/^user_/);
      expect(info.scopes).toEqual(expect.arrayContaining(['cli:read']));
    });

    it('verifies an org-scoped API key (subject = org_*)', async () => {
      const info = await fx.auth.verifyToken(fx.orgApiKey.secret!);
      expect(info.type).toBe('api_key');
      expect(info.subject).toBe(fx.org.id);
      expect(info.subject).toMatch(/^org_/);
    });

    it('verifies a machine-scoped API key (subject = mch_*)', async () => {
      const info = await fx.auth.verifyToken(fx.machineApiKey.secret!);
      expect(info.type).toBe('api_key');
      expect(info.subject).toBe(fx.machine.id);
      expect(info.subject).toMatch(/^mch_/);
    });
  });

  describe('auth.verifyTokenFromRequest', () => {
    it('reads the Bearer header and verifies', async () => {
      const req = bearerRequest(fx.userApiKey.secret!);
      const info = await fx.auth.verifyTokenFromRequest(req, { accepts: 'api_key' });
      expect(info.subject).toBe(fx.user.id);
      expect(info.type).toBe('api_key');
    });

    it('throws on a missing Authorization header', async () => {
      const req = new Request('http://test.local/cli');
      await expect(fx.auth.verifyTokenFromRequest(req)).rejects.toThrow(/Authorization/);
    });
  });

  describe('rejects credentials that are not API keys or OAuth tokens', () => {
    it('rejects a raw unrecognized credential', async () => {
      await expect(fx.auth.verifyToken('not-a-real-token')).rejects.toThrow();
    });

    it('rejects an unknown prefix', async () => {
      await expect(fx.auth.verifyToken('xyz_unknown_prefix_token')).rejects.toThrow();
    });

    it('rejects an M2M-prefixed token (mt_*) — m2m is not a CLI credential', async () => {
      // Fake mt_ value; we don't need a real M2M token to prove the gate. BAPI rejects it,
      // and our code surfaces the rejection.
      await expect(fx.auth.verifyToken('mt_not_a_real_m2m_token_value')).rejects.toThrow();
    });
  });

  describe('auth.resolveIdentity (default)', () => {
    it('projects subject + claims into Identity', async () => {
      const info = await fx.auth.verifyToken(fx.userApiKey.secret!);
      const identity = await fx.auth.resolveIdentity({
        tokenInfo: info,
        request: bearerRequest(fx.userApiKey.secret!),
      });
      expect(identity.sub).toBe(fx.user.id);
    });
  });

  describe('handle() end-to-end', () => {
    it('200 with Identity body for a user-scoped API key', async () => {
      const route = handle({ auth: fx.auth, accepts: 'api_key' });
      const res = await route(bearerRequest(fx.userApiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.user.id);
    });

    it('200 with Identity body for an org-scoped API key', async () => {
      const route = handle({ auth: fx.auth, accepts: 'api_key' });
      const res = await route(bearerRequest(fx.orgApiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.org.id);
    });

    it('200 with Identity body for a machine-scoped API key', async () => {
      const route = handle({ auth: fx.auth, accepts: 'api_key' });
      const res = await route(bearerRequest(fx.machineApiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.machine.id);
    });

    it('401 when no Authorization header is present', async () => {
      const route = handle({ auth: fx.auth, accepts: 'any' });
      const res = await route(new Request('http://test.local/cli'));
      expect(res.status).toBe(401);
    });

    it('401 for unsupported credential types', async () => {
      const route = handle({ auth: fx.auth, accepts: 'any' });
      const res = await route(bearerRequest('not-a-real-token'));
      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('not_authenticated');
    });

    it('honors a custom resolveIdentity override', async () => {
      const route = handle({
        auth: fx.auth,
        accepts: 'api_key',
        resolveIdentity: ({ tokenInfo }) => ({
          sub: tokenInfo.subject,
          custom_field: 'enriched',
        }),
      });
      const res = await route(bearerRequest(fx.userApiKey.secret!));
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

      const res = await route(bearerRequest(fx.userApiKey.secret!));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Identity;
      expect(body.sub).toBe(fx.user.id);
    });
  });
});
