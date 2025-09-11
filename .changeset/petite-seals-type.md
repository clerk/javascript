---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Allow to hide organization slug on `choose-organization` task screen

```tsx
// With standalone task component usage
<TaskChooseOrganization hideSlug />
```

```tsx
// When tasks are displayed within `SignIn/SignUp`
<SignIn tasksProps={{ hideSlug: true }} />
<SignUp tasksProps={{ hideSlug: true }} />
```
