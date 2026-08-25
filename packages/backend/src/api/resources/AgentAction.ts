import type { AgentActionEffect, AgentActionEvaluation, AgentActionStatusValue } from './Enums';
import type { AgentActionDecisionJSON, AgentActionJSON, AgentActionStatusJSON } from './JSON';

/**
 * One row of the reviewer-facing rendering of an Agent Action's parameters. `value` is
 * formatted server-side from the field registry's declared display format.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export type AgentActionParametersDisplay = {
  /** The parameter key, in the exact spelling the check was made with. */
  key: string;
  /** The human-readable label declared for this key in the field registry. */
  label: string;
  /** The formatted value shown to the reviewer. Always a scalar — non-scalar leaves are omitted from the projection. */
  value: string | number | boolean;
};

/**
 * A single rule that could not be evaluated. Present only when `evaluation` is `'error'`.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export type AgentActionEvaluationError = {
  /** The id of the rule that failed to evaluate. */
  ruleId: string;
  /** The reason the rule was skipped. */
  message: string;
};

/**
 * The approval stamp applied when an Agent Action is created `pending`. It survives
 * resolution as an audit record, so do not infer liveness from it — `status` is
 * authoritative once the action is terminal.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export type AgentActionApproval = {
  /** The organization role key routed to review this action, or `null` when the subject is the reviewer. */
  role: string | null;
  /** The URL a human visits to review the action. Derived at serialization time from the instance's current accounts host, so it is not stable across an accounts-domain change. */
  url: string;
  /** The Unix timestamp (in milliseconds) when the approval window closes. */
  expiresAt: number;
};

/**
 * Who answered a pending Agent Action and when. The answer itself is carried by
 * `status` (`approved` or `rejected`), not by this block.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export type AgentActionResolution = {
  /** The ID of the user who resolved the action. */
  resolvedByUserId: string;
  /** The Unix timestamp (in milliseconds) when the action was resolved. */
  resolvedAt: number;
  /** The reviewer's comment, visible to the application but never to the agent. */
  resolutionComment: string | null;
};

/**
 * The Backend `AgentActionDecision` object is the immutable record of what the policy
 * engine decided for an Agent Action, written once and never updated. The human's answer
 * lives on the [`AgentAction`](#agentaction) as a resolution; the engine's lives here as
 * an effect.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export class AgentActionDecision {
  constructor(
    /** The unique identifier for the decision. */
    readonly id: string,
    /** The ID of the Agent Action this decision was made for. */
    readonly actionId: string,
    /** The ID of the policy that decided. `null` when no active policy existed. */
    readonly policyId: string | null,
    /** The revision of the policy document that decided. `null` exactly when `policyId` is `null`. */
    readonly policyRevision: number | null,
    /** The author-chosen ID of the deciding rule. `null` when the policy's `default_effect` decided. */
    readonly ruleId: string | null,
    /** What the engine decided. Never branch control flow on this — see [`AgentAction.status`](#agentaction). */
    readonly effect: AgentActionEffect,
    /** The deny rule's stated reason, or, on a fail-closed downgrade, the engine-generated cause naming the missing party or unresolvable role. */
    readonly reason: string | null,
    /** Whether the policy document evaluated cleanly. */
    readonly evaluation: AgentActionEvaluation,
    /** The rules that were skipped, in priority order. Non-`null` exactly when `evaluation` is `'error'`. */
    readonly evaluationErrors: AgentActionEvaluationError[] | null,
    /** The Unix timestamp (in milliseconds) when the decision was recorded. */
    readonly createdAt: number,
  ) {}

  static fromJSON(data: AgentActionDecisionJSON): AgentActionDecision {
    return new AgentActionDecision(
      data.id,
      data.action_id,
      data.policy_id,
      data.policy_revision,
      data.rule_id,
      data.effect,
      data.reason,
      data.evaluation,
      data.evaluation_errors?.map(error => ({ ruleId: error.rule_id, message: error.message })) ?? null,
      data.created_at,
    );
  }
}

/**
 * The Backend `AgentAction` object represents one policy-checked operation an agent
 * attempted on a person's behalf, together with what the policy decided and, if a human
 * was asked, how they answered. Every `check()` creates one, including operations the
 * policy immediately allows.
 *
 * Not to be confused with [`AgentTask`](#agenttask), an unrelated session-creation
 * affordance that only sorts next to this object alphabetically.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export class AgentAction {
  constructor(
    /** The unique identifier for the Agent Action. */
    readonly id: string,
    /**
     * Where the action stands. `pending` is the only non-terminal value, and this is the
     * only field control flow should branch on: a fail-closed downgrade produces
     * `'denied'` here alongside a `decision.effect` of `'require_approval'`, so a caller
     * keying off the effect would wait forever on an action that was denied at creation.
     */
    readonly status: AgentActionStatusValue,
    /** The identifier of the agent that attempted the operation. */
    readonly actorId: string,
    /** The ID of the user the agent was acting on behalf of. */
    readonly subjectId: string | null,
    /** The ID of the organization the operation was scoped to. */
    readonly organizationId: string | null,
    /** The ID of the OAuth application the agent was authorized through. A display and audit snapshot only; no policy rule addresses it. */
    readonly authorizedClientId: string | null,
    /** The operation being attempted, matching the `operation` a policy rule and a field-registry row address. */
    readonly operation: string,
    /**
     * The operation's arguments, exactly as they were sent. Keys are never normalized or
     * camel-cased in either direction, because the spelling used here is the spelling the
     * field registry and every policy leaf must use.
     */
    readonly parameters: Record<string, unknown>,
    /** The application-authored context shown to the reviewer. */
    readonly description: string | null,
    /** The reviewer-facing rendering of `parameters`, limited to the keys declared in the field registry. */
    readonly parametersDisplay: AgentActionParametersDisplay[],
    /** The content-bound deduplication key the action was created with, echoed so a caller can tell a replay from a fresh create. */
    readonly idempotencyKey: string | null,
    /** The approval stamp. Non-`null` if and only if the action was created `pending`, and it survives resolution. */
    readonly approval: AgentActionApproval | null,
    /** Who resolved the action and when. `null` until a human answers. */
    readonly resolution: AgentActionResolution | null,
    /** What the policy engine decided. */
    readonly decision: AgentActionDecision,
    /** The Unix timestamp (in milliseconds) when the Agent Action was created. */
    readonly createdAt: number,
    /** The Unix timestamp (in milliseconds) when the Agent Action was last updated. */
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: AgentActionJSON): AgentAction {
    return new AgentAction(
      data.id,
      data.status,
      data.actor_id,
      data.subject_id,
      data.organization_id,
      data.authorized_client_id,
      data.operation,
      data.parameters,
      data.description,
      data.parameters_display.map(entry => ({ key: entry.key, label: entry.label, value: entry.value })),
      data.idempotency_key,
      data.approval && { role: data.approval.role, url: data.approval.url, expiresAt: data.approval.expires_at },
      data.resolution && {
        resolvedByUserId: data.resolution.resolved_by_user_id,
        resolvedAt: data.resolution.resolved_at,
        resolutionComment: data.resolution.resolution_comment,
      },
      AgentActionDecision.fromJSON(data.decision),
      data.created_at,
      data.updated_at,
    );
  }
}

/**
 * The Backend `AgentActionStatus` object is the slim view of an Agent Action returned by
 * the resolution-delivery endpoint — the fields that change while a human decides. The
 * reviewer's identity and comment are deliberately absent, because this response flows
 * into an agent's context; read them from [`AgentAction`](#agentaction) instead.
 *
 * @experimental This is an experimental API and is subject to change.
 */
export class AgentActionStatus {
  constructor(
    /** The ID of the Agent Action this status describes. */
    readonly actionId: string,
    /** Where the action stands. Loop while this is `pending`; act when it is anything else. */
    readonly status: AgentActionStatusValue,
    /** What the policy engine decided. */
    readonly effect: AgentActionEffect,
    /** The deny rule's stated reason, or the engine-generated cause of a fail-closed downgrade. */
    readonly reason: string | null,
    /** Whether the policy document evaluated cleanly. */
    readonly evaluation: AgentActionEvaluation,
    /** The rules that were skipped, in priority order. Non-`null` exactly when `evaluation` is `'error'`. */
    readonly evaluationErrors: AgentActionEvaluationError[] | null,
    /** The Unix timestamp (in milliseconds) when the approval window closes. `null` when the action was never pending. */
    readonly expiresAt: number | null,
    /** The Unix timestamp (in milliseconds) when the action was resolved. `null` until then. */
    readonly resolvedAt: number | null,
    /** The Unix timestamp (in milliseconds) when the Agent Action was created. */
    readonly createdAt: number,
  ) {}

  static fromJSON(data: AgentActionStatusJSON): AgentActionStatus {
    return new AgentActionStatus(
      data.action_id,
      data.status,
      data.effect,
      data.reason,
      data.evaluation,
      data.evaluation_errors?.map(error => ({ ruleId: error.rule_id, message: error.message })) ?? null,
      data.expires_at,
      data.resolved_at,
      data.created_at,
    );
  }
}
