---
"@clerk/shared": minor
"@clerk/backend": minor
"@clerk/react": minor
"@clerk/vue": minor
"@clerk/clerk-js": patch
---

Expose agent task sessions on auth objects. Sessions created from an agent task now populate a new `agent` property (`{ sub, type: 'agent', task_id }`, the same shape as `Clerk.session.agent`) on the object returned by `auth()` and related helpers, and on `useAuth()`. Use a truthiness check (`if (agent)`) to detect an agent session. `agent` is `null` for other sessions and `undefined` before Clerk has loaded. The `agt` claim is now part of the `JwtPayload` types.
