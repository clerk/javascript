---
"@clerk/shared": minor
"@clerk/backend": minor
"@clerk/react": minor
"@clerk/vue": minor
"@clerk/clerk-js": minor
---

Expose agent sessions on auth objects and session resources. Agent sessions, which are agent task sessions and Poppy sessions, now populate a new `agent` property (`{ sub, type: 'agent', task_id, restricted }`, the same shape as `Clerk.session.agent`) on the object returned by `auth()` and related helpers, on `useAuth()`, on the backend `Session` resource, and on the sessions returned by `Clerk.user.getSessions()`. Use a truthiness check (`if (agent)`) to detect an agent session. `task_id` is optional: it is `undefined` for a Poppy session. On `auth()` and during server rendering, a Poppy session also has `agent.poppy` (`{ session_id, client_id, user_id, agent_id? }`) from the session token; `poppy` is experimental and can change in a minor release. `agent` is `null` for other sessions and `undefined` before Clerk has loaded. The `agt` claim is now part of the `JwtPayload` types as `AgentClaim`, with an optional `tsk` and an experimental `poppy` field. On `Clerk.session`, the sessions from `Clerk.user.getSessions()`, and the backend `Session` resource, `actor` also holds the agent for agent task sessions today; this will change in a future major version, so use `agent`. `agent.restricted` is `true` when the session is restricted: when the agent task that created it is restricted, and always for a Poppy session. On `auth()` and during server rendering it reads `false` until Clerk adds the flag to the session token, so do not gate on it.
