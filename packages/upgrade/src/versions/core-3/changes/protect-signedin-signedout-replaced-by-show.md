---
title: '`Protect`, `SignedIn`, and `SignedOut` replaced by `Show`'
matcher: '<(Protect|SignedIn|SignedOut)(\\s|>)'
matcherFlags: 'm'
category: 'breaking'
---

The authorization control components `Protect`, `SignedIn`, and `SignedOut` have been removed in favor of a single component: `Show`.

### Signed in / signed out

```diff
-import { SignedIn, SignedOut } from '@clerk/react';
+import { Show } from '@clerk/react';

-<SignedIn>
+<Show when="signedIn">
   <Dashboard />
-</SignedIn>
+</Show>

-<SignedOut>
+<Show when="signedOut">
   <SignIn />
-</SignedOut>
+</Show>
```

### Authorization checks (roles/permissions/features/plans)

```diff
-import { Protect } from '@clerk/react';
+import { Show } from '@clerk/react';

-<Protect role="admin" fallback={<p>Unauthorized</p>}>
+<Show when={{ role: 'admin' }} fallback={<p>Unauthorized</p>}>
   <AdminPanel />
-</Protect>
+</Show>

-<Protect permission="org:billing:manage">
+<Show when={{ permission: 'org:billing:manage' }}>
   <BillingSettings />
-</Protect>
+</Show>
```

If you were using `condition={(has) => ...}` on `Protect`, pass that callback to `when`:

```diff
-<Protect condition={(has) => has({ role: 'admin' }) && isAllowed}>
+<Show when={(has) => has({ role: 'admin' }) && isAllowed}>
   <AdminPanel />
-</Protect>
+</Show>
```

To auto-migrate common patterns, run the upgrade CLI (includes a `transform-protect-to-show` codemod):

```bash
npx @clerk/upgrade --release core-3
```
