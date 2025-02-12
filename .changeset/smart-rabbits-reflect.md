---
"@clerk/astro": minor
---

Remove deprecated `as` prop in the `<SignInButton />`, `<SignOutButton />`, and `<SignUpButton>` components. Please use the `asChild` prop if you are passing children to it.

Example:

```astro
---
import { SignInButton } from '@clerk/astro/components'
---

<SignInButton asChild>
  <button>Custom sign in button</button>
</SignInButton>
```
