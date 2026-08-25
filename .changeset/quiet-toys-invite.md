---
'@clerk/backend': minor
---

Add experimental `AgentAction`, `AgentActionDecision`, and `AgentActionStatus` resource types, describing an agent operation that was checked against a policy, what the policy decided, and how a human resolved it. These are exported as types only; the `clerk.policy` methods that return them ship separately.

Branch control flow on `AgentAction.status`, never on `decision.effect` — an action that could not be routed to a reviewer is created with a `denied` status while its decision still reads `require_approval`.
