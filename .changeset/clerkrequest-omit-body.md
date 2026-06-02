---
'@clerk/backend': patch
---

Stop `authenticateRequest` from consuming the incoming request body, which previously left downstream handlers unable to read it (for example a Hono POST route calling `c.req.json()`).
