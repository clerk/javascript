---
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/shared': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Support for permission checks with Gate.

Example usage:
//index.d.ts
```ts
declare global {
    interface OrganizationCustomPermissions {
      "org:appointment:accept":"org:appointment:accept";
      "org:appointment:decline":"org:appointment:decline";
      "org:patients:create":"org:patients:create";
    }

    interface OrganizationCustomPermissions {
      "org:doctor":"org:doctor";
      "org:nurse":"org:nurse";
    }
}

```


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
