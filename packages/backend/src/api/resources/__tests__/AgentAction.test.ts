import { describe, expect, it } from 'vitest';

import { AgentAction, AgentActionDecision, AgentActionStatus } from '../AgentAction';
import { deserialize } from '../Deserializer';
import type { AgentActionDecisionJSON, AgentActionJSON, AgentActionStatusJSON } from '../JSON';

const decisionJSON: AgentActionDecisionJSON = {
  object: 'agent_action_decision',
  id: 'agtactdec_2mL',
  action_id: 'agtact_2mK',
  policy_id: 'pol_2a8',
  policy_revision: 4,
  rule_id: 'rule_large_refund_approval',
  effect: 'require_approval',
  reason: null,
  evaluation: 'ok',
  evaluation_errors: null,
  created_at: 1755655200000,
};

const actionJSON: AgentActionJSON = {
  object: 'agent_action',
  id: 'agtact_2mK',
  status: 'pending',
  actor_id: 'https://codex.example.com/.well-known/cimd.json',
  subject_id: 'user_2h9K',
  organization_id: 'org_2bT',
  authorized_client_id: null,
  operation: 'api/v1/refund',
  parameters: { refund_amount: 25000, currency: 'usd', customer_id: 'cus_9x' },
  description: "Refund the customer's duplicate charge",
  parameters_display: [
    { key: 'refund_amount', label: 'Refund amount', value: '$250.00' },
    { key: 'customer_id', label: 'Customer', value: 'cus_9x' },
  ],
  idempotency_key: 'chg_dup_8821-refund',
  approval: {
    role: 'org:support_manager',
    url: 'https://accounts.example.com/action-approval/agtact_2mK',
    expires_at: 1755741600000,
  },
  resolution: null,
  decision: decisionJSON,
  created_at: 1755655200000,
  updated_at: 1755655200000,
};

describe('AgentAction', () => {
  describe('fromJSON', () => {
    it('maps every field of a pending action', () => {
      const action = AgentAction.fromJSON(actionJSON);

      expect(action).toBeInstanceOf(AgentAction);
      expect(action.id).toBe('agtact_2mK');
      expect(action.status).toBe('pending');
      expect(action.actorId).toBe('https://codex.example.com/.well-known/cimd.json');
      expect(action.subjectId).toBe('user_2h9K');
      expect(action.organizationId).toBe('org_2bT');
      expect(action.authorizedClientId).toBeNull();
      expect(action.operation).toBe('api/v1/refund');
      expect(action.description).toBe("Refund the customer's duplicate charge");
      expect(action.idempotencyKey).toBe('chg_dup_8821-refund');
      expect(action.createdAt).toBe(1755655200000);
      expect(action.updatedAt).toBe(1755655200000);
    });

    it('passes parameters through verbatim, without normalizing key spelling', () => {
      const action = AgentAction.fromJSON({
        ...actionJSON,
        parameters: { refundAmount: 25000, refund_amount: 100, 'Customer-Id': 'cus_9x', nested: { keepMe: true } },
      });

      // camelCasing here would silently unmatch a policy leaf keyed on the check-time spelling.
      expect(action.parameters).toEqual({
        refundAmount: 25000,
        refund_amount: 100,
        'Customer-Id': 'cus_9x',
        nested: { keepMe: true },
      });
      expect(Object.keys(action.parameters)).toEqual(['refundAmount', 'refund_amount', 'Customer-Id', 'nested']);
    });

    it('passes each parametersDisplay key through verbatim, in both spellings', () => {
      const action = AgentAction.fromJSON({
        ...actionJSON,
        parameters_display: [
          // snake_case is the direction that matters: §3.2 forbids the camelCasing applied everywhere else.
          { key: 'refund_amount', label: 'Refund amount', value: '$250.00' },
          { key: 'refundAmount', label: 'Refund amount (raw)', value: 25000 },
          { key: 'Customer-Id', label: 'Customer', value: 'cus_9x' },
        ],
      });

      expect(action.parametersDisplay).toEqual([
        { key: 'refund_amount', label: 'Refund amount', value: '$250.00' },
        { key: 'refundAmount', label: 'Refund amount (raw)', value: 25000 },
        { key: 'Customer-Id', label: 'Customer', value: 'cus_9x' },
      ]);
    });

    it('maps the approval block and leaves an unresolved action without a resolution', () => {
      const action = AgentAction.fromJSON(actionJSON);

      expect(action.approval).toEqual({
        role: 'org:support_manager',
        url: 'https://accounts.example.com/action-approval/agtact_2mK',
        expiresAt: 1755741600000,
      });
      expect(action.resolution).toBeNull();
    });

    it('maps the resolution block once a human has answered', () => {
      const action = AgentAction.fromJSON({
        ...actionJSON,
        status: 'approved',
        resolution: {
          resolved_by_user_id: 'user_2mR',
          resolved_at: 1755658800000,
          resolution_comment: 'Duplicate confirmed.',
        },
      });

      expect(action.status).toBe('approved');
      expect(action.resolution).toEqual({
        resolvedByUserId: 'user_2mR',
        resolvedAt: 1755658800000,
        resolutionComment: 'Duplicate confirmed.',
      });
      // api-contracts-v1 §3: the approval block survives resolution rather than being cleared.
      expect(action.approval).toEqual({
        role: 'org:support_manager',
        url: 'https://accounts.example.com/action-approval/agtact_2mK',
        expiresAt: 1755741600000,
      });
    });

    it('keeps status and decision.effect on separate axes for a fail-closed downgrade', () => {
      const action = AgentAction.fromJSON({
        ...actionJSON,
        status: 'denied',
        subject_id: null,
        approval: null,
        decision: { ...decisionJSON, effect: 'require_approval', reason: 'missing_subject_for_approval' },
      });

      // The five-part wire signature from api-contracts-v1 §3.
      expect(action.status).toBe('denied');
      expect(action.approval).toBeNull();
      expect(action.decision.effect).toBe('require_approval');
      expect(action.decision.evaluation).toBe('ok');
      expect(action.decision.reason).toBe('missing_subject_for_approval');
    });

    it('constructs the embedded decision as an AgentActionDecision', () => {
      const action = AgentAction.fromJSON(actionJSON);

      expect(action.decision).toBeInstanceOf(AgentActionDecision);
      expect(action.decision.id).toBe('agtactdec_2mL');
      expect(action.decision.actionId).toBe('agtact_2mK');
    });
  });
});

describe('AgentActionDecision', () => {
  describe('fromJSON', () => {
    it('maps a decision made against an active policy', () => {
      const decision = AgentActionDecision.fromJSON(decisionJSON);

      expect(decision.policyId).toBe('pol_2a8');
      expect(decision.policyRevision).toBe(4);
      expect(decision.ruleId).toBe('rule_large_refund_approval');
      expect(decision.effect).toBe('require_approval');
      expect(decision.evaluation).toBe('ok');
      expect(decision.evaluationErrors).toBeNull();
      expect(decision.createdAt).toBe(1755655200000);
    });

    it('maps the no-active-policy decision, where the policy pair is null', () => {
      const decision = AgentActionDecision.fromJSON({
        ...decisionJSON,
        policy_id: null,
        policy_revision: null,
        rule_id: null,
        effect: 'allow',
      });

      expect(decision.policyId).toBeNull();
      expect(decision.policyRevision).toBeNull();
      expect(decision.ruleId).toBeNull();
      expect(decision.effect).toBe('allow');
    });

    it('maps a deny decision, where the reason is the rule author’s', () => {
      const decision = AgentActionDecision.fromJSON({
        ...decisionJSON,
        rule_id: 'rule_refunds_over_limit',
        effect: 'deny',
        reason: 'Refunds above $100 are not delegated to agents.',
      });

      expect(decision.effect).toBe('deny');
      expect(decision.ruleId).toBe('rule_refunds_over_limit');
      expect(decision.reason).toBe('Refunds above $100 are not delegated to agents.');
    });

    it('maps evaluation errors in priority order', () => {
      const decision = AgentActionDecision.fromJSON({
        ...decisionJSON,
        evaluation: 'error',
        evaluation_errors: [
          { rule_id: 'rule_a', message: 'unknown field parameters.refundAmount' },
          { rule_id: 'rule_b', message: 'operator not valid for type' },
        ],
      });

      expect(decision.evaluation).toBe('error');
      expect(decision.evaluationErrors).toEqual([
        { ruleId: 'rule_a', message: 'unknown field parameters.refundAmount' },
        { ruleId: 'rule_b', message: 'operator not valid for type' },
      ]);
    });
  });
});

describe('AgentActionStatus', () => {
  const statusJSON: AgentActionStatusJSON = {
    object: 'agent_action_status',
    action_id: 'agtact_2mK',
    status: 'approved',
    effect: 'require_approval',
    reason: null,
    evaluation: 'ok',
    evaluation_errors: null,
    expires_at: 1755741600000,
    resolved_at: 1755658800000,
    created_at: 1755655200000,
  };

  describe('fromJSON', () => {
    it('maps every field', () => {
      const status = AgentActionStatus.fromJSON(statusJSON);

      expect(status).toBeInstanceOf(AgentActionStatus);
      expect(status.actionId).toBe('agtact_2mK');
      expect(status.status).toBe('approved');
      expect(status.effect).toBe('require_approval');
      expect(status.reason).toBeNull();
      expect(status.evaluation).toBe('ok');
      expect(status.evaluationErrors).toBeNull();
      expect(status.expiresAt).toBe(1755741600000);
      expect(status.resolvedAt).toBe(1755658800000);
      expect(status.createdAt).toBe(1755655200000);
    });

    it('leaves resolvedAt null while the action is pending', () => {
      const status = AgentActionStatus.fromJSON({ ...statusJSON, status: 'pending', resolved_at: null });

      expect(status.status).toBe('pending');
      expect(status.resolvedAt).toBeNull();
    });

    it('leaves expiresAt null for an action that was never pending', () => {
      const status = AgentActionStatus.fromJSON({
        ...statusJSON,
        status: 'allowed',
        effect: 'allow',
        expires_at: null,
        resolved_at: null,
      });

      expect(status.status).toBe('allowed');
      expect(status.expiresAt).toBeNull();
      expect(status.resolvedAt).toBeNull();
    });

    it('maps evaluation errors', () => {
      const status = AgentActionStatus.fromJSON({
        ...statusJSON,
        evaluation: 'error',
        evaluation_errors: [{ rule_id: 'rule_a', message: 'unknown field' }],
      });

      expect(status.evaluationErrors).toEqual([{ ruleId: 'rule_a', message: 'unknown field' }]);
    });

    it('maps an absent evaluation_errors to null, not undefined', () => {
      // The contract always sends the key; this pins the mapper's own floor of null over undefined.
      const { evaluation_errors: _omitted, ...withoutErrors } = statusJSON;
      const status = AgentActionStatus.fromJSON(withoutErrors as AgentActionStatusJSON);

      expect(status.evaluationErrors).toBeNull();
    });
  });
});

describe('deserialize', () => {
  it('routes an agent_action payload to AgentAction', () => {
    const { data } = deserialize<AgentAction>(actionJSON);

    expect(data).toBeInstanceOf(AgentAction);
    expect(data.id).toBe('agtact_2mK');
  });

  it('routes an agent_action_status payload to AgentActionStatus', () => {
    const { data } = deserialize<AgentActionStatus>({
      object: 'agent_action_status',
      action_id: 'agtact_2mK',
      status: 'pending',
      effect: 'require_approval',
      reason: null,
      evaluation: 'ok',
      evaluation_errors: null,
      expires_at: 1755741600000,
      resolved_at: null,
      created_at: 1755655200000,
    } satisfies AgentActionStatusJSON);

    expect(data).toBeInstanceOf(AgentActionStatus);
    expect(data.actionId).toBe('agtact_2mK');
  });

  it('routes a list of agent_action payloads', () => {
    const { data } = deserialize<AgentAction[]>({ data: [actionJSON], total_count: 1 });

    expect(data).toHaveLength(1);
    expect(data[0]).toBeInstanceOf(AgentAction);
  });

  it('has no arm for a top-level agent_action_decision, which the contract never returns', () => {
    const { data } = deserialize<AgentActionDecisionJSON>(decisionJSON);

    expect(data).not.toBeInstanceOf(AgentActionDecision);
    expect(data).toBe(decisionJSON);
  });
});
