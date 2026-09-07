import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClientJSON } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import { BaseResource, getClientResourceFromPayload } from '../core/resources/internal';

type HostedAuthOptions = { redirectUrl: string; mode?: 'sign-in' | 'sign-up' };
type HostedAuthContext = {
  ensureActive(): void;
  identityEpoch(): number;
  credential(): string;
  commitState(): Promise<void>;
  beginTokenTransaction(): string;
  commitTokenTransaction(id: string, update: () => void): Promise<void>;
  discardTokenTransaction(id: string): void;
};

function fail(message: string): never {
  throw new ClerkRuntimeError(message, { code: 'hosted_auth_failed' });
}

function base64url(bytes: Uint8Array) {
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function parseRedirect(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fail('Hosted auth requires a valid custom-scheme redirect URL.');
  }
  if (
    raw !== raw.trim() ||
    !raw.includes('://') ||
    ['http:', 'https:', 'file:', 'javascript:', 'data:'].includes(url.protocol.toLowerCase())
  ) {
    fail('Hosted auth requires a valid custom-scheme redirect URL.');
  }
  return url;
}

function singleValue(url: URL, name: string) {
  const values = url.searchParams.getAll(name);
  if (values.length !== 1 || !values[0]) {
    fail(`Hosted auth callback is missing a unique ${name}.`);
  }
  return values[0];
}

export function createHostedAuthOperations(clerk: Clerk, context: HostedAuthContext) {
  let pending:
    | {
        id: string;
        redirect: URL;
        state: string;
        verifier: string;
        epoch: number;
        credential: string;
        callback?: { nonce: string; sessionId: string };
      }
    | undefined;

  const cancelNativeHostedAuth = (id: string) => {
    if (pending?.id === id) {
      pending = undefined;
    }
  };

  return {
    cancelNativeHostedAuth,
    async beginNativeHostedAuth(options: HostedAuthOptions) {
      if (pending) {
        fail('A hosted authentication session is already in progress.');
      }
      const redirect = parseRedirect(options.redirectUrl);
      const id = base64url(crypto.getRandomValues(new Uint8Array(16)));
      const state = base64url(crypto.getRandomValues(new Uint8Array(16)));
      const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
      pending = { id, redirect, state, verifier, epoch: context.identityEpoch(), credential: context.credential() };
      try {
        const digest = await crypto.subtle.digest(
          'SHA-256',
          Uint8Array.from(verifier, character => character.charCodeAt(0)),
        );
        context.ensureActive();
        const body = {
          redirectUrl: options.redirectUrl,
          codeChallenge: base64url(new Uint8Array(digest)),
          state,
          mode: options.mode,
        };
        const create = () =>
          BaseResource._fetch(
            { path: '/client/hosted_auth', method: 'POST', body: body as any },
            { skipUpdateClient: true },
          );
        let result;
        try {
          result = await create();
        } catch (error) {
          if (!isClerkAPIResponseError(error) || !error.errors.some(item => item.code === 'signed_out')) {
            throw error;
          }
          if (clerk.client) {
            clerk.updateClient(await clerk.client.reload());
          }
          result = await create();
        }
        context.ensureActive();
        if (pending?.id !== id) {
          fail('Hosted authentication was cancelled.');
        }
        const response = result?.response as unknown as { object?: string; url?: string };
        let url: URL;
        try {
          url = new URL(response?.url || '');
        } catch {
          return fail('Hosted auth creation returned an invalid response.');
        }
        if (
          response?.object !== 'hosted_auth' ||
          url.protocol !== 'https:' ||
          !url.hostname ||
          url.username ||
          url.password
        ) {
          fail('Hosted auth creation returned an invalid response.');
        }
        pending.epoch = context.identityEpoch();
        pending.credential = context.credential();
        return { id, url: url.href, callbackUrlScheme: redirect.protocol.slice(0, -1) };
      } catch (error) {
        cancelNativeHostedAuth(id);
        throw error;
      }
    },
    prepareNativeHostedAuthCompletion(id: string, callbackUrl: string) {
      const flow = pending;
      if (!flow || flow.id !== id) {
        fail('The hosted authentication flow is no longer current.');
      }
      try {
        context.ensureActive();
        if (flow.epoch !== context.identityEpoch() || flow.credential !== context.credential()) {
          fail('Hosted auth completion could not update the current client.');
        }
        if (!callbackUrl.includes('://')) {
          fail('Hosted auth callback URL did not match the initiated redirect URL.');
        }
        const callback = new URL(callbackUrl);
        const redirect = flow.redirect;
        if (
          callback.protocol.toLowerCase() !== redirect.protocol.toLowerCase() ||
          callback.hostname.toLowerCase() !== redirect.hostname.toLowerCase() ||
          callback.port !== redirect.port ||
          callback.pathname !== redirect.pathname ||
          callback.username !== redirect.username ||
          callback.password !== redirect.password
        ) {
          fail('Hosted auth callback URL did not match the initiated redirect URL.');
        }
        if (singleValue(callback, 'state') !== flow.state) {
          fail('Hosted auth callback state did not match the initiated state.');
        }
        const nonce = singleValue(callback, 'rotating_token_nonce');
        const sessionId = singleValue(callback, 'created_session_id');
        flow.callback = { nonce, sessionId };
        return { sessionId };
      } catch (error) {
        cancelNativeHostedAuth(id);
        throw error;
      }
    },
    async completeNativeHostedAuth(id: string) {
      const flow = pending;
      if (!flow || flow.id !== id || !flow.callback) {
        fail('The hosted authentication flow is no longer current.');
      }
      const transaction = context.beginTokenTransaction();
      try {
        context.ensureActive();
        if (flow.epoch !== context.identityEpoch() || flow.credential !== context.credential()) {
          fail('Hosted auth completion could not update the current client.');
        }
        const { nonce: rotatingTokenNonce, sessionId } = flow.callback;
        const result = await BaseResource._fetch<ClientJSON>(
          {
            path: '/client',
            __internal_clientTokenTransaction: transaction,
            method: 'POST',
            body: { _method: 'GET', rotatingTokenNonce, codeVerifier: flow.verifier } as any,
          },
          { skipUpdateClient: true },
        );
        context.ensureActive();
        if (flow.epoch !== context.identityEpoch() || !context.credential()) {
          fail('Hosted auth completion could not update the current client.');
        }
        const clientJSON = result?.response;
        if (clientJSON?.object !== 'client' || !clientJSON.sessions?.some(session => session.id === sessionId)) {
          fail('Hosted auth completion did not include the created session.');
        }
        await context.commitTokenTransaction(transaction, () => {
          const client = getClientResourceFromPayload({ response: null, client: clientJSON });
          if (!client) {
            fail('Hosted auth completion could not update the current client.');
          }
          clerk.updateClient(client);
        });
        await context.commitState();
        await clerk.setActive({ session: sessionId });
        context.ensureActive();
        if (clerk.session?.id !== sessionId) {
          fail('Hosted auth completion could not activate the created session.');
        }
        return clerk.session;
      } finally {
        context.discardTokenTransaction(transaction);
        cancelNativeHostedAuth(id);
      }
    },
  };
}
