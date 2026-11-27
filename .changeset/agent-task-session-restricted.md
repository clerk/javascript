---
"@clerk/backend": minor
---

Add `sessionRestricted` and `organizationId` to `clerkClient.agentTasks.create()` and to the `AgentTask` resource. Pass `sessionRestricted: true` to create an agent session in which the Frontend API allows the agent only to read and to refresh its own session token, and refuses other writes with an `agent_session_forbidden` error. Pass `organizationId` to choose the Organization the session starts in; a restricted session can only use that Organization.
