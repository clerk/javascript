---
"@clerk/clerk-react": minor
---

Introducing experimental `asProvider`, `asStandalone` and `<X.Outlet/>` for UserButton and OrganizationSwitcher.
- `asProvider` converts UserButton and OrganizationSwitcher to a provider that defers rendering until `Outlet` is mounted.
- `Outlet` also accepts `asStandalone` which will skip the trigger of these components and display only the UI of was previously inside the popover. This allows developers to create their own triggers.

Example usage:
```tsx
<UserButton asProvider afterSignOutUrl='/'>
  <UserButton.UserProfilePage label="Custom Page" url="/custom-page"> 
    <h1> This is my page available to all children </h1>
  </UserButton.UserProfilePage>
  <UserButton.Outlet asStandalone />
</UserButton>
```

```tsx
<OrganizationSwitcher asProvider afterSignOutUrl='/'>
  <OrganizationSwitcher.OrganizationProfilePage label="Custom Page" url="/custom-page">
    <h1> This is my page available to all children </h1>
  </OrganizationSwitcher.OrganizationProfilePage>
  <OrganizationSwitcher.Outlet asStandalone />
</OrganizationSwitcher>
```
