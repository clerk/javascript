---
"@clerk/clerk-react": minor
---

Introducing experimental `asProvider`, `asStandalone`, and `<X.Outlet />` for `<UserButton />` and `<OrganizationSwitcher />` components.
- `asProvider` converts `<UserButton />` and `<OrganizationSwitcher />` to a provider that defers rendering until `<Outlet />` is mounted.
- `<Outlet />` also accepts a `asStandalone` prop. It will skip the trigger of these components and display only the UI which was previously inside the popover. This allows developers to create their own triggers.

Example usage:
```tsx
<UserButton __experimental_asProvider afterSignOutUrl='/'>
  <UserButton.UserProfilePage label="Custom Page" url="/custom-page"> 
    <h1> This is my page available to all children </h1>
  </UserButton.UserProfilePage>
  <UserButton.__experimental_Outlet __experimental_asStandalone />
</UserButton>
```

```tsx
<OrganizationSwitcher __experimental_asProvider afterSignOutUrl='/'>
  <OrganizationSwitcher.OrganizationProfilePage label="Custom Page" url="/custom-page">
    <h1> This is my page available to all children </h1>
  </OrganizationSwitcher.OrganizationProfilePage>
  <OrganizationSwitcher.__experimental_Outlet __experimental_asStandalone />
</OrganizationSwitcher>
```
