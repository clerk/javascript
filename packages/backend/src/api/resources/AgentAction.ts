import type { AgentActionEffect, AgentActionEvaluation, AgentActionStatusValue } from './Enums';
import type {
  AgentActionApprovalJSON,
  AgentActionDecisionJSON,
  AgentActionEvaluationErrorJSON,
  AgentActionJSON,
  AgentActionResolutionJSON,
  AgentActionStatusJSON,
} from './JSON';

/**
 * One row of the reviewer-facing rendering of an Agent Action's parameters. `value` is
 * formatted server-side from the field registry's declared display format.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class AgentActionEvaluationError {
  constructor(
    /** The id of the rule that failed to evaluate. */
    readonly ruleId: string,
    /** The reason the rule was skipped. */
    readonly message: string,
  ) {}

  static fromJSON(data: AgentActionEvaluationErrorJSON): AgentActionEvaluationError {
    return new AgentActionEvaluationError(data.rule_id, data.message);
  }
}

/** Shared by the decision record and the slim status view; an absent list means `null`, not `undefined`. */
function toEvaluationErrors(
  data: AgentActionEvaluationErrorJSON[] | null | undefined,
): AgentActionEvaluationError[] | null {
  return data?.map(error => AgentActionEvaluationError.fromJSON(error)) ?? null;
}

/**
 * The approval stamp applied when an Agent Action is created `pending`. It survives
 * resolution as an audit record, so do not infer liveness from it — `status` is
 * authoritative once the action is terminal.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class AgentActionApproval {
  constructor(
    /** The organization role key routed to review this action, or `null` when the subject is the reviewer. */
    readonly role: string | null,
    /** The URL a human visits to review the action. Derived at serialization time from the instance's current accounts host, so it is not stable across an accounts-domain change. */
    readonly url: string,
    /** The Unix timestamp (in milliseconds) when the approval window closes. */
    readonly expiresAt: number,
  ) {}

  static fromJSON(data: AgentActionApprovalJSON): AgentActionApproval {
    return new AgentActionApproval(data.role, data.url, data.expires_at);
  }
}

/**
 * Who answered a pending Agent Action and when. The answer itself is carried by
 * `status` (`approved` or `rejected`), not by this block.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class AgentActionResolution {
  constructor(
    /** The ID of the user who resolved the action. */
    readonly resolvedByUserId: string,
    /** The Unix timestamp (in milliseconds) when the action was resolved. */
    readonly resolvedAt: number,
    /** The reviewer's comment, visible to the application but never to the agent. */
    readonly resolutionComment: string | null,
  ) {}

  static fromJSON(data: AgentActionResolutionJSON): AgentActionResolution {
    return new AgentActionResolution(data.resolved_by_user_id, data.resolved_at, data.resolution_comment);
  }
}

/**
 * The Backend `AgentActionDecision` object is the immutable record of what the policy
 * engine decided for an Agent Action, written once and never updated. The human's answer
 * lives on the {@link AgentAction} as a resolution; the engine's lives here as an effect.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
    /** What the engine decided. Never branch control flow on this — branch on `status` on the {@link AgentAction} instead. */
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
      toEvaluationErrors(data.evaluation_errors),
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
 * Not to be confused with {@link AgentTask}, an unrelated session-creation affordance that
 * only sorts next to this object alphabetically.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
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
      data.parameters_display,
      data.idempotency_key,
      data.approval && AgentActionApproval.fromJSON(data.approval),
      data.resolution && AgentActionResolution.fromJSON(data.resolution),
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
 * into an agent's context; read them from {@link AgentAction} instead.
 *
 * @experimental This is an experimental API for the Agent Approvals feature that is available under a private beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export class AgentActionStatus {
  constructor(
    /** The ID of the Agent Action this status describes. */
    readonly actionId: string,
    /** Where the action stands. Loop while this is `pending`; act when it is anything else. */
    readonly status: AgentActionStatusValue,
    /** What the policy engine decided. Never branch control flow on this — branch on `status` above. */
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
      toEvaluationErrors(data.evaluation_errors),
      data.expires_at,
      data.resolved_at,
      data.created_at,
    );
  }
}
