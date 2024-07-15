---
"@clerk/astro": patch 
---

Move `@clerk/astro/components/*` to `@clerk/astro/components`

```diff
- import { UserProfile } from "@clerk/astro/components/interactive"
+ import { UserProfile } from "@clerk/astro/components"

- import { Protect } from "@clerk/astro/components/control"
+ import { Protect } from "@clerk/astro/components"

- import { SignInButton } from "@clerk/astro/components/unstyled"
+ import { SignInButton } from "@clerk/astro/components"
```
