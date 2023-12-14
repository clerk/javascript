---
"@clerk/clerk-react": major
---

Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`.

If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

Before:

```jsx
"use client"

import { useRouter } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs";

export const Signout = () => {
  const router = useRouter()

  return (
    <SignOutButton signOutCallback={() => router.push("/your-path")}>
      <button>Sign Out</button>
    </SignOutButton>
  )
}
```

After:

```jsx
"use client"

import { SignOutButton } from "@clerk/nextjs";

export const Signout = () => {
  return (
    <SignOutButton redirectUrl="/your-path">
      <button>Sign Out</button>
    </SignOutButton>
  )
}
```
