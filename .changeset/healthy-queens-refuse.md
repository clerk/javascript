---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduce `nameFieldsOrder` appearance layout prop which enables rendering the last name before first name where applicable.

```tsx
<ClerkProvider
  appearance={{
    layout: {
      nameFieldsOrder: 'reversed',
    },
  }}
>
  ...
</ClerkProvider>
```
