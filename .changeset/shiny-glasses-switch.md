---
'@clerk/chrome-extension': major
---

Expand the ability for `@clerk/chrome-extension` WebSSO to sync with host applications which use URL-based session syncing.

### How to Update

**WebSSO Local Development Host Permissions:**

Add `*://localhost:*/*` to the `host_permissions` array in your `manifest.json` file:
```json
{
  "host_permissions": ["*://localhost:*/*"]
}
```

If you're using a local domain other than `localhost`, you'll want replace that entry with your domain: `*://<DOMAIN>/*`

```json
{
  "host_permissions": ["*://<DOMAIN>/*"]
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

  // [Development Only]: If the host application isn't on 
  // `http://localhost`, you can provide it here:
  syncSessionHost="http://<DOMAIN>"
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
