---
'@clerk/fastify': patch
---

Registering `clerkPlugin` on Fastify <5 now throws an actionable error that tells you exactly how to resolve the mismatch — either upgrade to `fastify@^5` or pin `@clerk/fastify@^1` to stay on Fastify 4 LTS — instead of the generic `FST_ERR_PLUGIN_VERSION_MISMATCH` you would previously see during registration.
