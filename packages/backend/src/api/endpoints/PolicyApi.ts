import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';

import type { AuthenticatedMachineObject, AuthObject } from '../../tokens/authObjects';
import { isMachineTokenType } from '../../tokens/machine';
import type { ClerkBackendApiRequestOptions } from '../request';
import type { AgentAction } from '../resources/AgentAction';
import { AbstractAPI } from './AbstractApi';

const basePath = '/agent_actions';

/**
 * The response shape returned by every method on `clerk.policy`. Unlike every other
 * endpoint class in this package, `PolicyAPI` returns errors instead of throwing them.
 *
 * Transport failure and policy outcome are separate axes: branch on `errors` first, then
 * switch on `data.status`.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type PolicyApiResponse<T> =
  | {
      data: T;
      errors: null;
    }
  | {
      data: null;
      errors: ClerkAPIError[];
      /** The HTTP status of the failed response. This is how a caller distinguishes a 409 `agent_action_idempotency_mismatch` from a 422 validation failure. */
      status?: number;
      /** The HTTP status text of the failed response. */
      statusText?: string;
      /** The Clerk trace ID of the failed response, for support requests. */
      clerkTraceId?: string;
      /** The value of the response's `Retry-After` header, in seconds, when one was sent. */
      retryAfter?: number;
    };

/**
 * The fields every `check()` call carries, regardless of how the parties are established.
 * Module-private, like {@link ActorIdParam}: the three arms it composes into are the public
 * surface, so it carries no `@experimental` or typedoc annotations of its own.
 */
type CheckPayload = {
  /** The operation being attempted, matching the `operation` a policy rule and a field-registry row address. Required, max 255 characters. */
  operation: string;
  /**
   * The operation's arguments. Keys are sent to the API byte-for-byte — the spelling used
   * here is the spelling the field registry and every policy leaf must use.
   *
   * @default {}
   */
  parameters?: Record<string, unknown>;
  /**
   * Application-authored context shown to the reviewer. Never mirror user or agent input
   * into this field.
   *
   * @default undefined
   */
  description?: string;
  /**
   * Content-bound deduplication key, scoped to `(instance, actorId, idempotencyKey)`. Reusing
   * a key with different content returns an `agent_action_idempotency_mismatch` error rather
   * than a replay.
   *
   * @default undefined
   */
  idempotencyKey?: string;
};

/** Shared by all three arms, so that omitting `actorId` is a compile error however the parties are established. */
type ActorIdParam = {
  /**
   * The identifier of the agent that attempted the operation: an OAuth application id
   * (`oa_…`), or a CIMD `client_id` URL. The shape is documented and never validated, so a
   * later identifier form does not need an SDK release.
   *
   * Always supplied by you, on every arm. No Clerk credential unambiguously names the agent:
   * an inbound token's client id is ambiguous between the party that exchanged it and the
   * party the human authorized, and only your application knows which topology it is in.
   */
  actorId: string;
};

/**
 * `api_key` and `m2m_token` callers. Neither credential names an agent, so `actorId` is
 * required; neither names a human either, so `subjectId` is required as well — an action
 * created without a subject downgrades fail-closed to `denied` before it is ever reviewed.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 * @generateWithEmptyComment
 */
export type OpaqueMachineCheckParams = CheckPayload &
  ActorIdParam & {
    /** The verified machine auth object for the request. An `api_key`'s subject is the key's owner and an `m2m_token`'s is a machine, so neither party field is derived from it. */
    auth: AuthenticatedMachineObject<'api_key' | 'm2m_token'>;
    /** The ID of the user the agent is acting on behalf of. Required: no opaque machine credential names one. */
    subjectId: string;
    /**
     * The ID of the organization the operation is scoped to.
     *
     * @default undefined
     */
    organizationId?: string;
    /**
     * The ID of the OAuth application the agent was authorized through. A display and audit
     * snapshot only; no policy rule addresses it.
     *
     * @default undefined
     */
    authorizedClientId?: string;
  };

/**
 * `oauth_token` callers. The token verifiably names the human it was issued for and the
 * client that human consented to, so `subjectId` and `authorizedClientId` are derived from
 * it and are **not** accepted here. It names no agent, so `actorId` is still required.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 * @generateWithEmptyComment
 */
export type OAuthMachineCheckParams = CheckPayload &
  ActorIdParam & {
    /** The verified OAuth machine auth object for the request. `subjectId` is derived from its `userId` and `authorizedClientId` from its `clientId`. */
    auth: AuthenticatedMachineObject<'oauth_token'>;
    /**
     * The ID of the organization the operation is scoped to.
     *
     * @default undefined
     */
    organizationId?: string;
    subjectId?: never;
    authorizedClientId?: never;
  };

/**
 * Callers outside the auth flow, and every session caller — `check` accepts no signed-in
 * auth object, because no session claim names an agent. A session caller passes
 * `subjectId: auth.userId` and `organizationId: auth.orgId` alongside the `actorId` its own
 * application knows.
 *
 * The party fields here are unverifiable assertions made by your backend; see the trust
 * model in the API contract.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 * @generateWithEmptyComment
 */
export type ExplicitCheckParams = CheckPayload &
  ActorIdParam & {
    auth?: never;
    /**
     * The ID of the user the agent is acting on behalf of. Required, and nullable: `null`
     * declares that this actor has no bound human, which is the mode `subject.id` +
     * `exists: false` policy leaves address. It is required rather than optional so a
     * session caller cannot omit it by accident and land on a fail-closed `denied`.
     */
    subjectId: string | null;
    /**
     * The ID of the organization the operation is scoped to.
     *
     * @default undefined
     */
    organizationId?: string;
    /**
     * The ID of the OAuth application the agent was authorized through. A display and audit
     * snapshot only; no policy rule addresses it.
     *
     * @default undefined
     */
    authorizedClientId?: string;
  };

/**
 * The parameters accepted by `clerk.policy.check()`, split by how the parties to the check
 * are established. The arms are keyed on the auth object's `tokenType` so that the contract's
 * obligations are compile-time facts: omitting `actorId` fails to compile on every arm, as
 * does omitting `subjectId` anywhere it is not derived.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 * @generateWithEmptyComment
 */
export type CheckParams = OpaqueMachineCheckParams | OAuthMachineCheckParams | ExplicitCheckParams;

/**
 * The auth object arms `check` accepts are the authenticated machine ones. A signed-out,
 * unauthenticated, or invalid-token object fails the premise of the call, and so does a
 * session object — no session claim names an agent, so there is nothing to derive from one.
 *
 * This is a type error as well, since none of those inhabit {@link CheckParams}. The runtime
 * check is for JavaScript callers and for values that crossed a boundary untyped.
 */
function assertAuthenticatedMachineObject(auth: AuthObject | null): asserts auth is AuthenticatedMachineObject {
  if (!auth || !auth.isAuthenticated || !auth.tokenType || !isMachineTokenType(auth.tokenType)) {
    throw new Error(
      'clerk.policy.check() requires an authenticated machine auth object (`api_key`, `m2m_token`, or `oauth_token`). Session, signed-out, and invalid-token auth objects name no agent — pass the party fields explicitly instead, omitting `auth`.',
    );
  }
}

/**
 * Checks an agent's proposed operation against the instance's policy, and reads back the
 * Agent Actions that result.
 *
 * Every method returns a {@link PolicyApiResponse} rather than throwing on an API failure.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 * @generateWithEmptyComment
 */
export class PolicyAPI extends AbstractAPI {
  /**
   * Derives the party fields the caller's credential establishes and passes through the ones
   * it does not. Only the `oauth_token` arm derives anything: its token verifiably names the
   * human it was issued for and the client that human consented to.
   *
   * `actorId` is never derived on any arm.
   */
  #toCheckBodyParams(params: CheckParams): Record<string, unknown> {
    const { auth, operation, parameters, description, idempotencyKey, actorId, organizationId } = params;

    const payload = { operation, parameters, description, idempotencyKey, actorId, organizationId };

    // Strictly `undefined`, not falsy: a caller who passed an `auth` that resolved to `null`
    // meant to derive from it, so that is an insufficient-auth throw rather than a silent fall
    // through to the explicit arm, where a dropped `subject_id` becomes a fail-closed `denied`.
    if (auth === undefined) {
      return { ...payload, subjectId: params.subjectId, authorizedClientId: params.authorizedClientId };
    }

    assertAuthenticatedMachineObject(auth);

    if (auth.tokenType === 'oauth_token') {
      return { ...payload, subjectId: auth.userId, authorizedClientId: auth.clientId };
    }

    return { ...payload, subjectId: params.subjectId, authorizedClientId: params.authorizedClientId };
  }

  /**
   * Issues a request through the inherited request function, restoring the native
   * `{ data, errors }` union that `requestFn` produces before `withLegacyRequestReturn`
   * discards it. Every method on this class goes through here rather than calling
   * `this.request` directly.
   *
   * The conversion is lossless: `requestFn` converts every failure into the errors arm and
   * never throws, so the legacy wrapper is the only thing that can throw and it throws
   * exactly one type, carrying through the fields of that arm it was given. Anything else
   * reaching the `catch` is a bug in a layer this surface does not own, and folding it into
   * an `errors` arm would disguise it — so it is rethrown.
   *
   * On a paginated route the wrapper resolves to `{ data, totalCount }`; a caller types `T`
   * as `PaginatedResourceResponse<…>` so that shape lands intact inside `data`, the way
   * `M2MTokenApi.list` types its own request.
   *
   * Delete this together with the legacy shim: once `buildRequest` stops wrapping,
   * `PolicyAPI` can take `requestFn` directly and this method has no reason to exist.
   */
  async #requestWithErrors<T>(options: ClerkBackendApiRequestOptions): Promise<PolicyApiResponse<T>> {
    try {
      return { data: await this.request<T>(options), errors: null };
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        return {
          data: null,
          errors: error.errors,
          status: error.status,
          statusText: error.message,
          clerkTraceId: error.clerkTraceId,
          retryAfter: error.retryAfter,
        };
      }
      throw error;
    }
  }

  /**
   * Checks an operation against the instance's policy, creating an Agent Action that records
   * what was attempted and what the policy decided. Every call creates one, including for
   * operations the policy immediately allows.
   *
   * This never blocks: an operation that needs a human returns `status: 'pending'` with an
   * `approval.url` to send them to. Await the answer with `waitForApproval`.
   *
   * **The parameter key spelling used here is the exact spelling the field-registry
   * declaration and every policy leaf must use.** `parameters.refundAmount` and
   * `parameters.refund_amount` are different fields, and a mismatch is a policy leaf that
   * never matches and never errors. There is no server-side guard for this.
   *
   * Branch on `data.status`, never on `data.decision.effect` — an action that could not be
   * routed to a reviewer is created `denied` while its decision still reads
   * `require_approval`, and a caller keying off the effect would wait forever.
   *
   * @param params - The operation to check, and the parties to attribute it to. `actorId` is
   * required on every arm; passing an `oauth_token` auth object derives the subject and the
   * authorized client from it.
   * @returns A {@link PolicyApiResponse} whose `data` is the created [`AgentAction`](https://clerk.com/docs/reference/backend/types/backend-agent-action).
   * @throws An `Error` if `auth` is present but is not an authenticated machine auth object.
   * @example
   * Check an operation on behalf of the human an OAuth token names
   * ```ts
   * import { createClerkClient } from '@clerk/backend';
   * const clerkClient = createClerkClient(...)
   *
   * const { data, errors } = await clerkClient.policy.check({
   *   auth, // an authenticated `oauth_token` auth object
   *   actorId: 'https://acme.example.com/mcp',
   *   operation: 'api/v1/refund',
   *   parameters: { charge_id: 'ch_9x', refund_amount: 25000, currency: 'usd' },
   * })
   *
   * if (errors) {
   *   // transport, auth, validation, or idempotency-mismatch failure
   * } else if (data.status === 'pending') {
   *   // send a human to data.approval.url
   * }
   * ```
   */
  public async check(params: CheckParams): Promise<PolicyApiResponse<AgentAction>> {
    const bodyParams = this.#toCheckBodyParams(params);

    return this.#requestWithErrors<AgentAction>({
      method: 'POST',
      path: basePath,
      bodyParams,
    });
  }
}
