import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import type {
  AuthenticatedMachineObject,
  InvalidTokenAuthObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from '../../tokens/authObjects';
import type { CheckParams, ExplicitCheckParams, OpaqueMachineCheckParams } from '../endpoints/PolicyApi';
import { createBackendApiClient } from '../factory';

describe('PolicyAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockDecision = {
    object: 'agent_action_decision',
    id: 'agtdec_2h9K',
    action_id: 'agtact_2h9K',
    policy_id: 'pol_2h9K',
    policy_revision: 3,
    rule_id: 'rule_large_refunds',
    effect: 'require_approval',
    reason: null,
    evaluation: 'ok',
    evaluation_errors: null,
    created_at: 1735689600000,
  };

  const mockAgentAction = {
    object: 'agent_action',
    id: 'agtact_2h9K',
    status: 'pending',
    actor_id: 'https://acme.example.com/mcp',
    subject_id: 'user_2h9K',
    organization_id: null,
    authorized_client_id: 'client_codex',
    operation: 'api/v1/refund',
    parameters: { chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' },
    description: 'Refunding an order the customer disputed.',
    parameters_display: [{ key: 'refundAmount', label: 'Refund amount', value: '$250.00' }],
    idempotency_key: 'refund-ch_9x',
    approval: {
      role: 'org:admin',
      url: 'https://accounts.acme.com/action-approval/agtact_2h9K',
      expires_at: 1735693200000,
    },
    resolution: null,
    decision: mockDecision,
    created_at: 1735689600000,
    updated_at: 1735689600000,
  };

  const apiKeyAuth: AuthenticatedMachineObject<'api_key'> = {
    id: 'ak_2h9K',
    subject: 'user_key_owner',
    scopes: [],
    getToken: () => Promise.resolve('ak_2h9K'),
    has: () => false,
    debug: () => ({}),
    tokenType: 'api_key',
    isAuthenticated: true,
    name: 'Acme backend key',
    claims: null,
    userId: 'user_key_owner',
    orgId: null,
  };

  const m2mAuth: AuthenticatedMachineObject<'m2m_token'> = {
    id: 'mt_2h9K',
    subject: 'mch_2h9K',
    scopes: [],
    getToken: () => Promise.resolve('mt_2h9K'),
    has: () => false,
    debug: () => ({}),
    tokenType: 'm2m_token',
    isAuthenticated: true,
    claims: null,
    machineId: 'mch_2h9K',
  };

  const oauthAuth: AuthenticatedMachineObject<'oauth_token'> = {
    id: 'oat_2h9K',
    // Deliberately different from `userId` below. The derivation table names `auth.userId` as
    // the source of `subject_id`; identical values here would let `auth.subject` pass too.
    subject: 'user_from_the_subject_field',
    scopes: ['profile'],
    getToken: () => Promise.resolve('oat_2h9K'),
    has: () => false,
    debug: () => ({}),
    tokenType: 'oauth_token',
    isAuthenticated: true,
    userId: 'user_2h9K',
    clientId: 'client_codex',
  };

  const unauthenticatedMachineAuth: UnauthenticatedMachineObject<'api_key'> = {
    id: null,
    subject: null,
    scopes: null,
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: () => ({}),
    tokenType: 'api_key',
    isAuthenticated: false,
    name: null,
    claims: null,
    userId: null,
    orgId: null,
  };

  // These three are annotated rather than left as inferred literals on purpose. An unannotated
  // literal widens `tokenType` to `string`, which is assignable to no arm of `CheckParams` under
  // any shape — so the `@ts-expect-error` assertions below would keep passing even if a session
  // arm were reintroduced. The annotation is what makes them discriminating.
  const invalidTokenAuth: InvalidTokenAuthObject = {
    isAuthenticated: false,
    tokenType: null,
    getToken: () => Promise.resolve(null),
    has: () => false,
    debug: () => ({}),
  };

  const signedOutAuth: SignedOutAuthObject = {
    ...invalidTokenAuth,
    tokenType: 'session_token',
    sessionClaims: null,
    sessionId: null,
    sessionStatus: null,
    actor: null,
    userId: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
  };

  const signedInAuth = {
    ...signedOutAuth,
    isAuthenticated: true,
    sessionId: 'sess_2h9K',
    userId: 'user_2h9K',
  } as unknown as SignedInAuthObject;

  /** Captures the body BAPI received, so a test can assert on the wire spelling. */
  const respondWith = (response: unknown, status = 200) => {
    let body: any;
    server.use(
      http.post(
        'https://api.clerk.test/v1/agent_actions',
        validateHeaders(async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(response as any, { status });
        }),
      ),
    );
    return () => body;
  };

  describe('check', () => {
    it('sends a snake_cased body and returns a camelCased resource', async () => {
      const body = respondWith(mockAgentAction);

      const { data, errors } = await apiClient.policy.check({
        actorId: 'https://acme.example.com/mcp',
        subjectId: 'user_2h9K',
        organizationId: 'org_2h9K',
        authorizedClientId: 'client_codex',
        operation: 'api/v1/refund',
        parameters: { chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' },
        description: 'Refunding an order the customer disputed.',
        idempotencyKey: 'refund-ch_9x',
      });

      expect(body()).toEqual({
        actor_id: 'https://acme.example.com/mcp',
        subject_id: 'user_2h9K',
        organization_id: 'org_2h9K',
        authorized_client_id: 'client_codex',
        operation: 'api/v1/refund',
        parameters: { chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' },
        description: 'Refunding an order the customer disputed.',
        idempotency_key: 'refund-ch_9x',
      });

      expect(errors).toBeNull();
      expect(data?.id).toBe('agtact_2h9K');
      expect(data?.status).toBe('pending');
      expect(data?.actorId).toBe('https://acme.example.com/mcp');
      expect(data?.subjectId).toBe('user_2h9K');
      expect(data?.authorizedClientId).toBe('client_codex');
      expect(data?.idempotencyKey).toBe('refund-ch_9x');
      expect(data?.approval?.expiresAt).toBe(1735693200000);
      expect(data?.resolution).toBeNull();
      expect(data?.decision.policyRevision).toBe(3);
      expect(data?.decision.ruleId).toBe('rule_large_refunds');
      expect(data?.createdAt).toBe(1735689600000);
    });

    it('passes parameter keys through verbatim in both directions', async () => {
      const body = respondWith(mockAgentAction);

      const { data } = await apiClient.policy.check({
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'api/v1/refund',
        parameters: { chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' },
      });

      // The spelling used in check() is the spelling the field registry and every policy
      // leaf must use, so a camelCase key must survive the request untouched.
      expect(body().parameters).toEqual({ chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' });
      expect(data?.parameters).toEqual({ chargeId: 'ch_9x', refundAmount: 25000, currency: 'usd' });
      expect(data?.parametersDisplay[0].key).toBe('refundAmount');
    });

    it('sends a null subject_id when the explicit arm declares no bound human', async () => {
      const body = respondWith({ ...mockAgentAction, subject_id: null });

      const { data } = await apiClient.policy.check({
        actorId: 'oa_2h9K',
        subjectId: null,
        operation: 'api/v1/refund',
      });

      expect(body()).toEqual({
        actor_id: 'oa_2h9K',
        subject_id: null,
        operation: 'api/v1/refund',
      });
      expect(data?.subjectId).toBeNull();
    });

    it('derives nothing from an api_key auth object', async () => {
      const body = respondWith(mockAgentAction);

      await apiClient.policy.check({
        auth: apiKeyAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'api/v1/refund',
      });

      // An api_key's subject is the key's owner, not the human the agent acts for, so the
      // caller's subjectId wins and the auth object contributes nothing.
      expect(body()).toEqual({
        actor_id: 'oa_2h9K',
        subject_id: 'user_2h9K',
        operation: 'api/v1/refund',
      });
    });

    it('derives nothing from an m2m_token auth object', async () => {
      const body = respondWith(mockAgentAction);

      await apiClient.policy.check({
        auth: m2mAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        authorizedClientId: 'client_codex',
        operation: 'api/v1/refund',
      });

      // machineId is a machine, not an agent, so it never becomes actor_id.
      expect(body()).toEqual({
        actor_id: 'oa_2h9K',
        subject_id: 'user_2h9K',
        authorized_client_id: 'client_codex',
        operation: 'api/v1/refund',
      });
    });

    it('derives subject_id and authorized_client_id from an oauth_token auth object', async () => {
      const body = respondWith(mockAgentAction);

      await apiClient.policy.check({
        auth: oauthAuth,
        actorId: 'https://acme.example.com/mcp',
        operation: 'api/v1/refund',
      });

      // actor_id and authorized_client_id differ under the MCP topology: the token names the
      // client the human consented to, never the agent that exchanged it.
      expect(body()).toEqual({
        actor_id: 'https://acme.example.com/mcp',
        subject_id: 'user_2h9K',
        authorized_client_id: 'client_codex',
        operation: 'api/v1/refund',
      });
    });

    it('returns the fail-closed downgrade with a denied status and a require_approval effect', async () => {
      respondWith({
        ...mockAgentAction,
        status: 'denied',
        approval: null,
        decision: {
          ...mockDecision,
          effect: 'require_approval',
          reason: 'No reviewer could be resolved for the subject.',
        },
      });

      const { data } = await apiClient.policy.check({
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'api/v1/refund',
      });

      expect(data?.status).toBe('denied');
      expect(data?.decision.effect).toBe('require_approval');
      expect(data?.decision.reason).toBe('No reviewer could be resolved for the subject.');
      expect(data?.approval).toBeNull();
    });

    it('returns an idempotency mismatch rather than throwing it', async () => {
      respondWith(
        {
          errors: [
            {
              code: 'agent_action_idempotency_mismatch',
              message: 'Idempotency key reused with different content',
              long_message: 'An agent action already exists for this idempotency key with different parameters.',
            },
          ],
        },
        409,
      );

      const response = await apiClient.policy.check({
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'api/v1/refund',
        idempotencyKey: 'refund-ch_9x',
      });

      expect(response.data).toBeNull();
      // `status` lives on the errors arm alone, so branching on `errors` is what reaches it.
      if (!response.errors) {
        throw new Error('Expected the errors arm');
      }
      expect(response.status).toBe(409);
      expect(response.errors[0].code).toBe('agent_action_idempotency_mismatch');
      expect(response.errors[0].message).toBe('Idempotency key reused with different content');
    });

    it('throws on a signed-out auth object', async () => {
      const params: CheckParams = {
        // @ts-expect-error A signed-out auth object does not inhabit `CheckParams`.
        auth: signedOutAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'op',
      };

      await expect(apiClient.policy.check(params)).rejects.toThrow(
        'clerk.policy.check() requires an authenticated machine auth object',
      );
    });

    it('throws on an unauthenticated machine auth object', async () => {
      const params: CheckParams = {
        // @ts-expect-error An unauthenticated machine object does not inhabit `CheckParams`.
        auth: unauthenticatedMachineAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'op',
      };

      await expect(apiClient.policy.check(params)).rejects.toThrow(
        'clerk.policy.check() requires an authenticated machine auth object',
      );
    });

    it('throws on an invalid-token auth object', async () => {
      const params: CheckParams = {
        // @ts-expect-error An invalid-token auth object does not inhabit `CheckParams`.
        auth: invalidTokenAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'op',
      };

      await expect(apiClient.policy.check(params)).rejects.toThrow(
        'clerk.policy.check() requires an authenticated machine auth object',
      );
    });

    it('throws when auth is present but resolved to null', async () => {
      const params: CheckParams = {
        // @ts-expect-error `null` inhabits no arm; a caller who passed `auth` meant to derive from it.
        auth: null,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'op',
      };

      // Not a silent fall through to the explicit arm, where a dropped subject becomes a
      // fail-closed `denied` that never reaches a reviewer.
      await expect(apiClient.policy.check(params)).rejects.toThrow(
        'clerk.policy.check() requires an authenticated machine auth object',
      );
    });

    it('accepts no signed-in auth object, and throws if one reaches it untyped', async () => {
      const params: CheckParams = {
        // @ts-expect-error No arm accepts a `SignedInAuthObject`: no session claim names an agent.
        auth: signedInAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_2h9K',
        operation: 'op',
      };

      await expect(apiClient.policy.check(params)).rejects.toThrow(
        'clerk.policy.check() requires an authenticated machine auth object',
      );
    });
  });

  describe('CheckParams', () => {
    it('requires actorId on the explicit arm', () => {
      // @ts-expect-error `actorId` is required on every arm.
      const params: ExplicitCheckParams = { subjectId: 'user_2h9K', operation: 'api/v1/refund' };

      expect(params).toBeDefined();
    });

    it('requires actorId on the opaque machine arm', () => {
      // @ts-expect-error `actorId` is required on every arm.
      const params: OpaqueMachineCheckParams = { auth: apiKeyAuth, subjectId: 'user_2h9K', operation: 'op' };

      expect(params).toBeDefined();
    });

    it('requires actorId on the oauth_token arm', () => {
      // @ts-expect-error `actorId` is required on every arm.
      const params: CheckParams = { auth: oauthAuth, operation: 'api/v1/refund' };

      expect(params).toBeDefined();
    });

    it('requires subjectId on the explicit arm', () => {
      // @ts-expect-error `subjectId` is required, so a session caller cannot omit it and land on a fail-closed denial.
      const params: ExplicitCheckParams = { actorId: 'oa_2h9K', operation: 'api/v1/refund' };

      expect(params).toBeDefined();
    });

    it('requires subjectId on the opaque machine arm', () => {
      // @ts-expect-error No opaque machine credential names a human, so `subjectId` is required.
      const params: OpaqueMachineCheckParams = { auth: apiKeyAuth, actorId: 'oa_2h9K', operation: 'op' };

      expect(params).toBeDefined();
    });

    it('does not accept subjectId on the oauth_token arm', () => {
      // @ts-expect-error Derived from the token's `userId`, so it is not overridable.
      const params: CheckParams = {
        auth: oauthAuth,
        actorId: 'oa_2h9K',
        subjectId: 'user_someone_else',
        operation: 'op',
      };

      expect(params).toBeDefined();
    });

    it('does not accept authorizedClientId on the oauth_token arm', () => {
      // @ts-expect-error Derived from the token's `clientId`, so it is not overridable.
      const params: CheckParams = {
        auth: oauthAuth,
        actorId: 'oa_2h9K',
        authorizedClientId: 'client_attacker',
        operation: 'op',
      };

      expect(params).toBeDefined();
    });
  });
});
