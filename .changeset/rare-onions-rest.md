---
"@clerk/astro": patch
---

Allow child elements in unstyled Astro components.

Usage:

```astro
---
import { SignInButton } from '@clerk/components/astro'
---

<SignInButton>
  <button>Sign in with Clerk</button>
</SignInButton>
```
