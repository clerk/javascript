---
'@clerk/fastify': patch
'@clerk/express': patch
'@clerk/astro': patch
'@clerk/nuxt': patch
'@clerk/tanstack-react-start': patch
'@clerk/react-router': patch
---

Use runtime middleware keys when creating the request client used by server-side auth middleware, so nonce handshake payload exchange works when keys are passed directly to framework middleware.
