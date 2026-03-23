---
title: '`as` prop removed from Astro button components'
packages: ['astro']
matcher: '<Sign(In|Up|Out)Button[\s\S]*?\bas\b'
matcherFlags: 'm'
category: 'deprecation-removal'
---

The deprecated `as` prop has been removed from unstyled button components in `@clerk/astro`. Use the `asChild` prop with a custom element in the default slot instead.

Affected components: `SignInButton`, `SignUpButton`, `SignOutButton`, `CheckoutButton`, `PlanDetailsButton`, `SubscriptionDetailsButton`.

```diff
- <SignInButton as="a" href="/sign-in">
-   Sign in
- </SignInButton>
+ <SignInButton asChild>
+   <a href="/sign-in">Sign in</a>
+ </SignInButton>
```
