---
"@clerk/shared": minor
---

Introduce unified environment variable handling across all supported platforms

Usage:

```ts
import { getEnvVariable } from '@clerk/shared/getEnvVariable'

const publishableKey = getEnvVariable('CLERK_PUBLISHABLE_KEY')
```
