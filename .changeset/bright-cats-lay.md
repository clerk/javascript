---
'@clerk/clerk-js': minor
---

Introduce `<TaskSelectOrganization />` component.

It allows you to eject the organization selection task flow from the default `SignIn` and `SignUp` components and render it on custom URL paths using `taskUrls`.

Usage example:
```tsx
<ClerkProvider taskUrls={{ 'select-organization': '/onboarding/select-organization' }}>
  <App />
</ClerkProvider>
```

```tsx
function OnboardingSelectOrganization() {
  return <TaskSelectOrganization redirectUrlComplete="/dashboard/onboarding-complete" />
}
```
