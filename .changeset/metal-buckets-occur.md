---
'@clerk/astro': major
---

Remove deprecated `as` prop from unstyled button components (`SignInButton`, `SignUpButton`, `SignOutButton`, `CheckoutButton`, `PlanDetailsButton`, `SubscriptionDetailsButton`). Use the `asChild` prop with a custom element in the default slot instead.

**Before:**

```astro
<SignInButton as="a" href="/sign-in">
  Sign in
</SignInButton>
```

**After:**

```astro
<SignInButton asChild>
  <a href="/sign-in">Sign in</a>
</SignInButton>
```
