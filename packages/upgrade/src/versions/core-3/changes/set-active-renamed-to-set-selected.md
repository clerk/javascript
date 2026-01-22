---
title: '`setActive` renamed to `setSelected`'
matcher: 'setActive'
category: 'deprecation-removal'
---

The `setActive` method has been renamed to `setSelected` to better reflect its behavior with pending sessions. Update all usages:

```diff
// Method calls
- await clerk.setActive({ session: sessionId });
+ await clerk.setSelected({ session: sessionId });

// Destructuring from hooks
- const { setActive } = useSignIn();
+ const { setSelected } = useSignIn();

- const { setActive } = useSignUp();
+ const { setSelected } = useSignUp();

- const { setActive } = useSessionList();
+ const { setSelected } = useSessionList();

- const { setActive } = useOrganizationList();
+ const { setSelected } = useOrganizationList();
```

## Type Changes

The following types have also been renamed:

```diff
- SetActive
+ SetSelected

- SetActiveParams
+ SetSelectedParams

- SetActiveNavigate
+ SetSelectedNavigate

- SetActiveHook
+ SetSelectedHook
```
