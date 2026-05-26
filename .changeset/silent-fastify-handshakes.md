---
'@clerk/fastify': patch
---

Fixed an issue where secrets passed directly to clerkPlugin() were not used when verifying sessions, causing authentication failures when keys are loaded at runtime. The runtime-key Clerk client is also now available on `request.clerk` and derives its API URL from runtime publishable keys unless an explicit `apiUrl` is provided.
