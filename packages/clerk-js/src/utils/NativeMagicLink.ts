import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import type { MobileAuthCallback, MobileAuthenticationResult } from '@clerk/shared/mobile';
import type { SignUpJSON } from '@clerk/shared/types';

import type { Clerk } from '../core/clerk';
import { BaseResource, SignUp } from '../core/resources/internal';

type StoredFlow = {
  schemaVersion: 1;
  kind: 'signIn' | 'signUp';
  flowId: string;
  codeVerifier: string;
  createdAt: number;
  expiresAt: number;
};
type Storage = {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  remove(): Promise<void>;
};
type CompleteResponse = SignUpJSON | { ticket: string; flow_id?: string };

const terminalCodes = new Set([
  'approval_token_consumed',
  'approval_token_expired',
  'approval_token_invalid',
  'pkce_verification_failed',
  'flow_not_approved',
]);
const fail = (code: string) => new ClerkRuntimeError('The email link could not be completed.', { code });

export class NativeMagicLink {
  authCallback: MobileAuthCallback | null = null;
  #generation = 0;
  #callbackSequence = 0;
  #writes: Promise<unknown> = Promise.resolve();
  #callbacks = new Map<string, Promise<MobileAuthenticationResult>>();

  constructor(
    private readonly clerk: Clerk,
    private readonly callbackUrl: string,
    private readonly storage: Storage | undefined,
    private readonly digest: (value: string) => Promise<string>,
    private readonly attestation?: () => Promise<string | null>,
  ) {}

  async prepare(kind: StoredFlow['kind'], flowId: string | undefined) {
    if (!this.storage) {
      throw fail('capability_unavailable:authStorage');
    }
    if (!flowId) {
      throw fail('missing_email_link_attempt');
    }
    const generation = ++this.#generation;
    this.authCallback = null;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const verifier = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const challenge = await this.digest(verifier);
    this.assertCurrent(generation);
    if (!/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
      throw fail('invalid_digest_result');
    }
    const createdAt = Date.now();
    const flow: StoredFlow = {
      schemaVersion: 1,
      kind,
      flowId,
      codeVerifier: verifier,
      createdAt,
      expiresAt: createdAt + 600_000,
    };
    await this.serialized(async () => {
      this.assertCurrent(generation);
      await this.requireStorage().write(JSON.stringify(flow));
    });
    this.assertCurrent(generation);
    return { redirect_uri: this.callbackUrl, code_challenge: challenge, code_challenge_method: 'S256' };
  }

  async handle(url: URL): Promise<MobileAuthenticationResult | null> {
    const expected = new URL(this.callbackUrl);
    if (
      url.protocol !== expected.protocol ||
      url.host !== expected.host ||
      url.pathname !== expected.pathname ||
      url.username !== expected.username ||
      url.password !== expected.password ||
      Array.from(expected.searchParams).some(([key, value]) => url.searchParams.get(key) !== value)
    ) {
      return null;
    }
    if (!url.searchParams.has('flow_id') || !url.searchParams.has('approval_token')) {
      return null;
    }
    const flowId = url.searchParams.get('flow_id')?.trim();
    const approvalToken = url.searchParams.get('approval_token')?.trim();
    if (!flowId || !approvalToken) {
      throw fail('invalid_email_link_callback');
    }
    const key = JSON.stringify([flowId, approvalToken]);
    const existing = this.#callbacks.get(key);
    if (existing) {
      return existing;
    }
    const pending = this.complete(flowId, approvalToken);
    this.#callbacks.set(key, pending);
    try {
      return await pending;
    } finally {
      if (this.#callbacks.get(key) === pending) {
        this.#callbacks.delete(key);
      }
    }
  }

  clearCallback(id: number): void {
    if (this.authCallback?.id === id) {
      this.authCallback = null;
    }
  }

  async reset(): Promise<void> {
    ++this.#generation;
    this.authCallback = null;
    if (this.storage) {
      await this.serialized(() => this.requireStorage().remove());
    }
  }

  private async complete(flowId: string, approvalToken: string): Promise<MobileAuthenticationResult> {
    if (!this.storage) {
      throw fail('capability_unavailable:authStorage');
    }
    const generation = this.#generation;
    const flow = await this.serialized(() => this.read());
    this.assertCurrent(generation);
    if (!flow) {
      throw fail('no_pending_email_link');
    }
    if (flow.flowId !== flowId) {
      throw fail('email_link_flow_mismatch');
    }
    let response: CompleteResponse | undefined;
    try {
      const attestation = await this.attestation?.();
      this.assertCurrent(generation);
      response = (
        await BaseResource._fetch<CompleteResponse>({
          method: 'POST',
          path: '/client/magic_links/complete',
          body: {
            flow_id: flowId,
            approval_token: approvalToken,
            code_verifier: flow.codeVerifier,
            ...(attestation ? { attestation } : {}),
          } as any,
        })
      )?.response;
    } catch (error) {
      if (
        isClerkAPIResponseError(error) &&
        error.errors.some(
          ({ code, meta }) =>
            terminalCodes.has(code) || (code === 'form_param_value_invalid' && meta?.paramName === 'flow_id'),
        )
      ) {
        await this.clearStored(flow);
      }
      throw error;
    }
    this.assertCurrent(generation);
    await this.clearStored(flow);
    this.assertCurrent(generation);
    if (!response || typeof response !== 'object') {
      throw fail('invalid_email_link_response');
    }
    let result: MobileAuthenticationResult;
    if (flow.kind === 'signIn') {
      if (!('ticket' in response) || typeof response.ticket !== 'string' || !response.ticket) {
        throw fail('invalid_email_link_response');
      }
      const signIn = this.clerk.client?.signIn.__internal_future;
      if (!signIn) {
        throw fail('clerk_not_loaded');
      }
      const { error } = await signIn.ticket({ ticket: response.ticket });
      if (error) {
        throw error;
      }
      result = { kind: 'signIn', signIn };
    } else {
      if (!('object' in response) || response.object !== 'sign_up' || response.id !== flow.flowId) {
        throw fail('invalid_email_link_response');
      }
      const signUp = this.clerk.client?.signUp;
      if (!(signUp instanceof SignUp)) {
        throw fail('clerk_not_loaded');
      }
      signUp.__internal_updateFromJSON(response);
      result = { kind: 'signUp', signUp: signUp.__internal_future };
    }
    this.assertCurrent(generation);
    this.authCallback = { id: ++this.#callbackSequence, result };
    return result;
  }

  private async read(): Promise<StoredFlow | undefined> {
    const raw = await this.requireStorage().read();
    if (!raw) {
      return;
    }
    try {
      const value = JSON.parse(raw);
      const flow = {
        schemaVersion: 1 as const,
        kind: value.kind ?? (value.state === 'SIGN_UP' ? 'signUp' : 'signIn'),
        flowId: value.flowId ?? value.flow_id,
        codeVerifier: value.codeVerifier ?? value.code_verifier,
        createdAt: value.createdAt ?? value.created_at ?? value.createdAtEpochMs,
        expiresAt: value.expiresAt ?? value.expires_at ?? value.expiresAtEpochMs,
      };
      if (
        (value.schemaVersion === undefined || value.schemaVersion === 1) &&
        ['signIn', 'signUp'].includes(flow.kind) &&
        typeof flow.flowId === 'string' &&
        flow.flowId &&
        typeof flow.codeVerifier === 'string' &&
        /^[A-Za-z0-9_-]{43,128}$/.test(flow.codeVerifier) &&
        Number.isFinite(flow.createdAt) &&
        Number.isFinite(flow.expiresAt) &&
        flow.expiresAt > Date.now()
      ) {
        return flow;
      }
    } catch {
      // Invalid persisted data is discarded below.
    }
    await this.requireStorage().remove();
    return;
  }

  private async clearStored(flow: StoredFlow): Promise<void> {
    await this.serialized(async () => {
      const current = await this.read();
      if (current?.codeVerifier === flow.codeVerifier && current.flowId === flow.flowId) {
        await this.requireStorage().remove();
      }
    });
  }

  private requireStorage(): Storage {
    if (!this.storage) {
      throw fail('capability_unavailable:authStorage');
    }
    return this.storage;
  }

  private serialized<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#writes.then(operation);
    this.#writes = result.catch(() => undefined);
    return result;
  }

  private assertCurrent(generation: number): void {
    if (generation !== this.#generation) {
      throw fail('stale_authentication_attempt');
    }
  }
}
