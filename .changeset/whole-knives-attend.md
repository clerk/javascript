---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Add `taskUrls` option to customize task flow URLs:

```tsx
<ClerkProvider
  taskUrls={{
    'org': '/my-custom-org-selector'
  }}
/>
```
