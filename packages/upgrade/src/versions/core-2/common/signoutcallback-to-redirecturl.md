---
title: 'Replace `signOutCallback` prop on `SignOutButton` with `redirectUrl`'
matcher: "<SignOutButton[\\s\\S]*?signOutCallback=[\\s\\S]*?>"
matcherFlags: 'm'
---

The `signOutCallback` prop on the [`<SignOutButton />` component](https://clerk.com/docs/components/unstyled/sign-out-button) has been removed. Instead, you can use the `redirectUrl` prop. Example below:

```diff
  import { SignOutButton } from "@clerk/clerk-react";

  export const Signout = () => {
    return (
      <SignOutButton
-       signOutCallback={() => { window.location.href = "/your-path" }}
+       redirectUrl="/your-path"
      >
        <button>Sign Out</button>
      </SignOutButton>
    )
  }
```
