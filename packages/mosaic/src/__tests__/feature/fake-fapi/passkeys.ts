import type { PasskeyJSON } from '@clerk/shared/types';
import { http, HttpResponse } from 'msw';

import type { FakeFapiState } from '../fake-fapi';
import { fapiPasskey } from '../fapi';
import { envelope, error, missing, requestUser, updateUser } from './shared';

export interface FakePasskeysSeed {
  name?: string;
  authenticatorName?: string;
}

export function passkeyHandlers(
  state: Pick<FakeFapiState, 'client' | 'environment'>,
  fapiUrl: (path: string) => string,
  seed: FakePasskeysSeed = {},
) {
  const pendingPasskeys = new Map<string, { userId: string; passkey: PasskeyJSON; expiresAt: number }>();
  let nextPasskeyId = 1;

  return [
    http.post(fapiUrl('/v1/me/passkeys'), ({ request }) => {
      const user = requestUser(state, request);
      if (!user) {
        return missing();
      }
      if (!state.environment.user_settings.attributes.passkey.enabled) {
        return error('feature_not_enabled', 403);
      }
      if (
        state.environment.user_settings.enterprise_sso.enabled &&
        user.enterprise_accounts.some(
          account =>
            account.enterprise_connection?.active && account.enterprise_connection.disable_additional_identifications,
        )
      ) {
        return error('enterprise_sso_additional_identifications_disabled', 422);
      }
      if (user.passkeys.length >= 10) {
        return error('passkey_quota_exceeded', 403);
      }
      const now = Date.now();
      for (const [id, pending] of pendingPasskeys) {
        if (pending.userId === user.id && pending.expiresAt <= now) {
          pendingPasskeys.delete(id);
        }
      }
      const expiresAt = now + 10 * 60_000;
      const passkey = fapiPasskey({
        id: `passkey_${nextPasskeyId++}`,
        name: seed.name ?? 'Chrome on macOS',
        verification: {
          id: 'verification_passkey',
          object: 'verification',
          status: 'unverified',
          verified_at_client: '',
          strategy: 'passkey',
          attempts: 0,
          expire_at: expiresAt,
          error: { code: '', message: '' },
          nonce: JSON.stringify({
            challenge: 'Y2hhbGxlbmdl',
            rp: { name: 'Acme', id: 'localhost' },
            user: { id: 'dXNlcg', name: 'user@example.com', displayName: 'Test user' },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          }),
        },
      });
      pendingPasskeys.set(passkey.id, { userId: user.id, passkey, expiresAt });
      return envelope(passkey, state.client);
    }),
    http.post(fapiUrl('/v1/me/passkeys/:id/attempt_verification'), async ({ params, request }) => {
      const pending = typeof params.id === 'string' ? pendingPasskeys.get(params.id) : undefined;
      const user = requestUser(state, request);
      if (!user || !pending) {
        return missing();
      }
      if (pending.userId !== user.id) {
        return error('resource_forbidden', 403);
      }
      const { passkey } = pending;
      const verification = passkey.verification;
      if (!verification || pending.expiresAt <= Date.now()) {
        return error('verification_expired', 400);
      }
      const body = new URLSearchParams(await request.text());
      if (body.get('strategy') !== 'passkey' || !body.get('public_key_credential')) {
        return HttpResponse.json(
          { errors: [{ code: 'form_param_missing', message: 'Passkey credential required.' }] },
          { status: 400 },
        );
      }
      const verified = {
        ...passkey,
        name: seed.authenticatorName || passkey.name,
        last_used_at: Date.now(),
        verification: {
          ...verification,
          status: 'verified' as const,
          attempts: verification.attempts + 1,
          verified_at_client: state.client.id,
          nonce: undefined,
          error: undefined,
        },
      };
      pendingPasskeys.delete(passkey.id);
      updateUser(state, { ...user, passkeys: [...user.passkeys, verified] });
      return envelope(verified, state.client);
    }),
    http.post(fapiUrl('/v1/me/passkeys/:id'), async ({ params, request }) => {
      const user = requestUser(state, request);
      if (!user || typeof params.id !== 'string') {
        return missing();
      }
      const pending = pendingPasskeys.get(params.id);
      const passkey =
        user.passkeys.find(candidate => candidate.id === params.id) ??
        (pending?.userId === user.id ? pending.passkey : undefined);
      if (!passkey) {
        return missing();
      }
      const method = new URL(request.url).searchParams.get('_method');
      if (method === 'DELETE') {
        pendingPasskeys.delete(passkey.id);
        updateUser(state, { ...user, passkeys: user.passkeys.filter(candidate => candidate.id !== passkey.id) });
        return envelope({ object: 'passkey', id: passkey.id, deleted: true }, state.client);
      }
      if (method === 'PATCH') {
        const body = new URLSearchParams(await request.text());
        const name = body.get('name');
        if (name !== null && new TextEncoder().encode(name).length > 256) {
          return HttpResponse.json(
            {
              errors: [
                {
                  code: 'form_param_max_length_exceeded',
                  message: 'Passkey name is too long.',
                  meta: { param_name: 'name' },
                },
              ],
            },
            { status: 422 },
          );
        }
        const renamed = { ...passkey, name: name ?? passkey.name };
        if (pending?.userId === user.id) {
          pendingPasskeys.set(passkey.id, { ...pending, passkey: renamed });
          return envelope(renamed, state.client);
        }
        updateUser(state, {
          ...user,
          passkeys: user.passkeys.map(candidate => (candidate.id === passkey.id ? renamed : candidate)),
        });
        return envelope(renamed, state.client);
      }
      return missing();
    }),
  ];
}
