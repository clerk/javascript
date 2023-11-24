---
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Support for permission checks with Gate.

```tsx
<Gate permission="org:appointment:accept">
    <button>Accept appointment</button>
</Gate>
```

```tsx
<Gate role="org:doctor">
    <button>See patient's personal file</button>
</Gate>
```
