import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { SignInResource, SignUpJSON, SignUpResource } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import type { SignUp } from '../core/resources/internal';
import { BaseResource, getClientResourceFromPayload } from '../core/resources/internal';
import { type NativeCrypto, nativeCrypto } from './nativeCrypto';
import type { NativeIdentityContext } from './nativeIdentity';
import type { NativeStorage } from './nativeStorage';

type Flow = 'signIn' | 'signUp';
type PendingFlow = { kind: Flow; flow_id?: string; code_verifier: string; created_at: number; expires_at: number };
type Completion = {
  id: string;
  flow: PendingFlow;
  raw: string;
  flowId: string;
  approvalToken: string;
  epoch: number;
  resultId?: string;
};
const storageKey = 'pendingMagicLinkFlow';
const terminalCodes = new Set([
  'approval_token_consumed',
  'approval_token_expired',
  'approval_token_invalid',
  'pkce_verification_failed',
  'flow_not_approved',
]);

function fail(message: string): never {
  throw Object.assign(new Error(message), { code: 'magic_link_failed' });
}

const identity = (flow: PendingFlow) => JSON.stringify([flow.kind, flow.flow_id ?? null, flow.code_verifier]);

export function createMagicLinkOperations(
  clerk: Clerk,
  storage: NativeStorage | undefined,
  context: NativeIdentityContext,
  finish: (flow: Flow) => Promise<SignInResource | SignUpResource>,
  crypto: NativeCrypto = nativeCrypto,
) {
  const owners = new Map<string, string>();
  let completion: Completion | { id: string; epoch: number } | undefined;
  const client = () => {
    if (!clerk.client) {
      fail('The client is not initialized.');
    }
    return clerk.client;
  };
  const access: NativeStorage = request => {
    context.ensureActive();
    if (!storage) {
      fail('Secure storage is unavailable.');
    }
    return storage(request);
  };
  const clear = async (raw: string, flow?: PendingFlow) => {
    // A failed deletion can be retried after the consumed approval token is rejected.
    await access({ operation: 'compareAndSwap', key: storageKey, expected: raw, value: null }).catch(() => undefined);
    if (flow) {
      owners.delete(identity(flow));
    }
  };
  const load = async () => {
    const raw = await access({ operation: 'read', key: storageKey });
    if (typeof raw !== 'string') {
      return;
    }
    let flow: PendingFlow | undefined;
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.kind == null || parsed.kind === 'signIn' || parsed.kind === 'signUp') &&
        (parsed.flow_id == null || typeof parsed.flow_id === 'string') &&
        typeof parsed.code_verifier === 'string' &&
        parsed.code_verifier &&
        Number.isFinite(parsed.created_at) &&
        Number.isFinite(parsed.expires_at) &&
        parsed.expires_at > Date.now()
      ) {
        flow = { ...parsed, kind: parsed.kind ?? 'signIn' };
      }
    } catch {
      /* Invalid legacy data is removed below. */
    }
    if (!flow) {
      await clear(raw);
      return;
    }
    return { raw, flow };
  };
  const current = (id: string) => {
    context.ensureActive();
    if (
      !completion ||
      !('flow' in completion) ||
      completion.id !== id ||
      completion.epoch !== context.identityEpoch()
    ) {
      fail('The magic link completion is no longer current.');
    }
    return completion;
  };
  const cancelNativeMagicLinkCompletion = (id: string) => {
    if (completion?.id === id) {
      completion = undefined;
    }
  };

  const operations = {
    cancelNativeMagicLinkCompletion,
    async createNativeMagicLinkSignIn(options: { emailAddress: string; redirectUrl: string; ownerId?: string }) {
      const identifier = options.emailAddress.trim();
      if (!identifier) {
        fail('Email address is required.');
      }
      if (!clerk.client) {
        fail('The client is not initialized.');
      }
      await client().signIn.create({ identifier });
      const expectedId = client().signIn.id;
      if (!expectedId) {
        fail('The authentication attempt is no longer current.');
      }
      return operations.sendNativeMagicLink({
        flow: 'signIn',
        expectedId,
        redirectUrl: options.redirectUrl,
        ownerId: options.ownerId,
      });
    },
    async sendNativeMagicLink(options: {
      flow: Flow;
      expectedId: string;
      redirectUrl: string;
      emailAddressId?: string;
      ownerId?: string;
    }) {
      const resource = clerk.client?.[options.flow];
      if (!resource?.id || resource.id !== options.expectedId) {
        fail('The authentication attempt is no longer current.');
      }
      let emailAddressId = options.emailAddressId;
      if (options.flow === 'signIn') {
        const signIn = client().signIn;
        const factors = signIn.supportedFirstFactors?.filter(factor => factor.strategy === 'email_link');
        const factor = factors?.find(factor => factor.safeIdentifier === signIn.identifier) ?? factors?.[0];
        emailAddressId ??= factor && 'emailAddressId' in factor ? factor.emailAddressId : undefined;
        if (!emailAddressId) {
          fail('Email link sign-in is not available for this sign-in.');
        }
      }
      if (!options.redirectUrl) {
        fail(
          options.flow === 'signIn'
            ? 'Redirect URI is missing. Unable to start email link sign-in.'
            : 'Redirect URI is missing. Unable to start email link sign-up verification.',
        );
      }
      const epoch = context.identityEpoch();
      const verifier = await crypto.randomString(32);
      const challenge = await crypto.codeChallenge(verifier);
      context.ensureActive();
      if (epoch !== context.identityEpoch() || clerk.client?.[options.flow].id !== options.expectedId) {
        fail('The authentication attempt is no longer current.');
      }
      const now = Date.now();
      const flow: PendingFlow = {
        kind: options.flow,
        flow_id: options.expectedId,
        code_verifier: verifier,
        created_at: now,
        expires_at: now + 600000,
      };
      await access({ operation: 'write', key: storageKey, value: JSON.stringify(flow) });
      owners.clear();
      if (options.ownerId) {
        owners.set(identity(flow), options.ownerId);
      }
      context.ensureActive();
      if (epoch !== context.identityEpoch() || clerk.client?.[options.flow].id !== options.expectedId) {
        fail('The authentication attempt is no longer current.');
      }
      const params = {
        strategy: 'email_link' as const,
        redirectUrl: options.redirectUrl,
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      };
      if (options.flow === 'signIn') {
        if (!emailAddressId) {
          fail('Email link sign-in is not available for this sign-in.');
        }
        return client().signIn.prepareFirstFactor({ ...params, emailAddressId });
      }
      return client().signUp.prepareVerification(params);
    },
    async beginNativeMagicLinkCompletion(options: { callbackUrl?: string; flowId?: string; approvalToken?: string }) {
      if (completion) {
        fail('A magic link completion is already in progress.');
      }
      const callback = options.callbackUrl ? new URL(options.callbackUrl) : undefined;
      const flowId = (callback ? callback.searchParams.get('flow_id') : options.flowId)?.trim();
      const approvalToken = (callback ? callback.searchParams.get('approval_token') : options.approvalToken)?.trim();
      if (!flowId) {
        fail('Magic link callback is missing flow_id.');
      }
      if (!approvalToken) {
        fail('Magic link callback is missing approval_token.');
      }
      const id = await crypto.randomString(16);
      // Reserve before storage IO so two callbacks cannot redeem the same verifier.
      completion = { id, epoch: context.identityEpoch() };
      try {
        const stored = await load();
        if (!stored) {
          fail('No pending magic link flow was found.');
        }
        if (stored.flow.flow_id != null && stored.flow.flow_id !== flowId) {
          fail('Magic link callback does not match the pending flow.');
        }
        context.ensureActive();
        if (completion?.id !== id || completion.epoch !== context.identityEpoch()) {
          fail('The magic link completion is no longer current.');
        }
        completion = { id, epoch: completion.epoch, flow: stored.flow, raw: stored.raw, flowId, approvalToken };
        return { id, ownerId: owners.get(identity(stored.flow)) };
      } catch (error) {
        cancelNativeMagicLinkCompletion(id);
        throw error;
      }
    },
    async completeNativeMagicLink(id: string) {
      const pending = current(id);
      const transaction = context.beginTokenTransaction();
      try {
        let payload;
        try {
          payload = await BaseResource._fetch(
            {
              path: '/client/magic_links/complete',
              method: 'POST',
              __internal_clientTokenTransaction: transaction,
              body: {
                flowId: pending.flowId,
                approvalToken: pending.approvalToken,
                codeVerifier: pending.flow.code_verifier,
              } as any,
            },
            { skipUpdateClient: true },
          );
        } catch (error) {
          if (
            isClerkAPIResponseError(error) &&
            error.errors.some(
              error =>
                terminalCodes.has(error.code) ||
                (error.code === 'form_param_value_invalid' && error.meta?.paramName === 'flow_id'),
            )
          ) {
            await clear(pending.raw, pending.flow);
          }
          throw error;
        }
        current(id);
        await clear(pending.raw, pending.flow);
        current(id);
        const response = payload?.response as unknown as Record<string, unknown>;
        if (pending.flow.kind === 'signIn' && typeof response?.ticket !== 'string') {
          fail('Magic link callback returned a sign-up for a sign-in flow.');
        }
        if (pending.flow.kind === 'signUp' && (response?.object !== 'sign_up' || typeof response.id !== 'string')) {
          fail('Magic link callback returned a ticket for a sign-up flow.');
        }
        await context.commitTokenTransaction(transaction, () => {
          const updatedClient = getClientResourceFromPayload(payload);
          if (updatedClient) {
            clerk.updateClient(updatedClient);
          }
          if (pending.flow.kind === 'signUp') {
            (client().signUp as SignUp).__internal_updateFromJSON(response as unknown as SignUpJSON);
          }
        });
        await context.commitState();
        pending.epoch = context.identityEpoch();
        if (pending.flow.kind === 'signIn') {
          await client().signIn.create({ strategy: 'ticket', ticket: response.ticket as string });
        }
        context.ensureActive();
        if (completion !== pending) {
          fail('The magic link completion is no longer current.');
        }
        pending.epoch = context.identityEpoch();
        const value = client()[pending.flow.kind];
        pending.resultId = value.id;
        const activation =
          value.status === 'complete' && value.createdSessionId
            ? { flowId: value.id, sessionId: value.createdSessionId }
            : undefined;
        return { kind: pending.flow.kind, resource: value, activation };
      } finally {
        context.discardTokenTransaction(transaction);
      }
    },
    async finishNativeMagicLinkCompletion(id: string) {
      const pending = current(id);
      try {
        if (!pending.resultId || clerk.client?.[pending.flow.kind].id !== pending.resultId) {
          fail('The authentication attempt is no longer current.');
        }
        return { kind: pending.flow.kind, resource: await finish(pending.flow.kind) };
      } finally {
        cancelNativeMagicLinkCompletion(id);
      }
    },
  };
  return operations;
}
