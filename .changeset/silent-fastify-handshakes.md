---
'@clerk/fastify': patch
---

Fixed an issue where secrets passed directly to clerkPlugin() were not used when verifying sessions, causing authentication failures when keys are loaded at runtime (e.g. AWS Secrets Manager on Lambda).
