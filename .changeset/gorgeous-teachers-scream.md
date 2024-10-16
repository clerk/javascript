---
"@clerk/express": minor
---

Export [`authenticateRequest` method](https://clerk.com/docs/references/backend/authenticate-request) from `@clerk/express` (in case you want to go low-level and implement flows to your specific needs). You can use it like so:

```ts
import { authenticateRequest } from "@clerk/express"
```

This function is adapted to Express' Request wrapper and as such notably different to the exported function from `@clerk/backend`. If you need to use it, be sure to import from `@clerk/express`.
