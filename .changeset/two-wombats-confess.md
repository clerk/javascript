---
'@clerk/clerk-expo': major
---

Support for [Expo Web](https://docs.expo.dev/workflow/web/) has been added! You can now build fullstack websites with Expo, React, and Clerk. Utilize [Clerk's components](https://clerk.com/docs/components/overview) to build out your app.

You can access the components from the `/web` subpath import like so:

```tsx
import { SignUp } from "@clerk/clerk-expo/web";

export default function Page() {
  return <SignUp />;
}
```

**Breaking change:** You need to use Expo 50 or later. The minimum required React Native version was bumped to `0.73`.
