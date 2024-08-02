---
'@clerk/clerk-js': minor
"@clerk/types": minor
---

Introducing a development mode warning when in development mode in order to mitigate going to production with development keys.

In case need to deactivate this UI change temporarily to simulate how components will look in production, you can do so by adding the `unsafe_disableDevelopmentModeWarnings` layout appearance prop to `<ClerkProvider>`

Example:

```tsx
<ClerkProvider
  appearance={{
    layout: {
      unsafe_disableDevelopmentModeWarnings: true,
    },
  }}
/>
```
