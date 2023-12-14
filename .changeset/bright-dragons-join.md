---
"@clerk/clerk-react": major
---

Replace the `signOutCallback` prop on the `<SignOutButton />` with `redirectUrl`. This aligns the API surface with other UI components provided by `@clerk/clerk-react`.

If you previously used the `signOutCallback` prop to navigate to another page, you can migrate as shown below.

Before:

```jsx
import { SignOutButton } from "@clerk/clerk-react";

export const Signout = () => {
  return (
    <SignOutButton signOutCallback={() => window.location.href = "/your-path"}>
      <button>Sign Out</button>
    </SignOutButton>
  )
}
```

After:

```jsx
import { SignOutButton } from "@clerk/clerk-react";

export const Signout = () => {
  return (
    <SignOutButton redirectUrl="/your-path">
      <button>Sign Out</button>
    </SignOutButton>
  )
}
```
