---
"@clerk/shared": minor
"@clerk/backend": minor
"@clerk/react": minor
"@clerk/vue": minor
"@clerk/clerk-js": minor
---

Expose agent task sessions on auth objects and session resources. Sessions created from an agent task now populate a new `agent` property (`{ sub, type: 'agent', task_id }`, the same shape as `Clerk.session.agent`) on the object returned by `auth()` and related helpers, on `useAuth()`, on the backend `Session` resource, and on the sessions returned by `Clerk.user.getSessions()`. Use a truthiness check (`if (agent)`) to detect an agent session. `agent` is `null` for other sessions and `undefined` before Clerk has loaded. The `agt` claim is now part of the `JwtPayload` types. On `Clerk.session`, the sessions from `Clerk.user.getSessions()`, and the backend `Session` resource, `actor` also holds the agent for agent task sessions today; this will change in a future major version, so use `agent`.
