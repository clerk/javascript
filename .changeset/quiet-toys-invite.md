---
'@clerk/backend': minor
'@clerk/shared': minor
---

Add experimental `AgentAction`, `AgentActionDecision`, and `AgentActionStatus` resource types to `@clerk/backend`, describing an agent operation that was checked against a policy, what the policy decided, and how a human resolved it. These are exported as types only; the `clerk.policy` methods that return them ship separately.

The lifecycle status an agent action can hold is exported from `@clerk/shared` as `AgentActionStatus`, and re-exported from `@clerk/backend` as `AgentActionStatusValue` to distinguish it from the resource of the same name. It is declared once so that `@clerk/backend` and the approval review surface share a single definition.

Branch control flow on `AgentAction.status`, never on `decision.effect` — an action that could not be routed to a reviewer is created with a `denied` status while its decision still reads `require_approval`.
