---
'@clerk/chrome-extension': major
---

Expand the ability for `@clerk/chrome-extension` WebSSO to sync with host applications which use URL-based session syncing.

### How to Update

**WebSSO Host Permissions:**

_Local Development: You must have your explicit development domain added to your `manifest.json` file in order to use the WebSSO flow._

Example:

```json
{
  "host_permissions": [
    // ...
    "http://localhost"
    // ...
  ]
}
```

_Production: You must have your explicit Clerk Frontend API domain added to your `manifest.json` file in order to use the WebSSO flow._

Example:
```json
{
  "host_permissions": [
    // ...
    "https://clerk.example.com"
    // ...
  ]
}
```

**WebSSO Provider settings:**

```tsx
<ClerkProvider
  publishableKey={publishableKey}
  routerPush={to => navigate(to)}
  routerReplace={to => navigate(to, { replace: true })}
  syncSessionWithTab

  // tokenCache is now storageCache (See below)
  storageCache={/* ... */}
>
```

**WebSSO Storage Cache Interface:**

With the prop change from `tokenCache` to `storageCache`, the interface has been expanded to allow for more flexibility.

The new interface is as follows:

```ts
type StorageCache = {
  createKey: (...keys: string[]) => string;
  get: <T = any>(key: string) => Promise<T>;
  remove: (key: string) => Promise<void>;
  set: (key: string, value: string) => Promise<void>;
};
```
