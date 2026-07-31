---
'@clerk/fastify': patch
'@clerk/express': patch
---

Respond with 400 Bad Request instead of surfacing a 500 when an incoming request cannot be represented as a fetch `Request`. Vulnerability-scanner probes such as hostless `//` request targets, targets that parse as credentialed URLs, and forbidden methods like TRACE previously threw inside the middleware and polluted error logs.
