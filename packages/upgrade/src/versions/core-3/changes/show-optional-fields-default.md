---
title: '`showOptionalFields` now defaults to `false`'
matcher: 'showOptionalFields'
category: 'behavior-change'
warning: true
---

The default value of `appearance.layout.showOptionalFields` (now `appearance.options.showOptionalFields`) has changed from `true` to `false`. Optional fields are now hidden by default during sign up.

To restore the previous behavior, explicitly set the option:

```jsx
<ClerkProvider
  appearance={{
    options: {
      showOptionalFields: true,
    }
  }}
>
```
