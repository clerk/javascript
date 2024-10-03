# Clerk Browser Extension Manifest

## Base Configuration

All Browser Extensions require, at minimum, the following configuration:

### Permissions

```json
{
  "permissions": ["storage"]
}
```

More info on the "storage" permission: [Google Developer Storage Reference](https://developer.chrome.com/docs/extensions/reference/storage/).

## Sync Host Configuration

When syncing with a host application, you must enable the following permissions:

### Permissions

```json
{
  "permissions": ["cookies", "storage"]
}
```

More info on the "cookies" permission: [Google Developer Cookies Reference](https://developer.chrome.com/docs/extensions/reference/cookies/).
More info on the "storage" permission: [Google Developer Storage Reference](https://developer.chrome.com/docs/extensions/reference/storage/).

### Host Permissions

You must enable the following host permissions in your `manifest.json` file. This will allow the extension to communicate with the host application.

```json
{
  "host_permissions": [
    "http://localhost/*"
    "https://<YOUR_CLERK_DEVELOPMENT_FRONTEND_API_GOES_HERE>/*", // e.g. "https://XXXXXXX.clerk.accounts.dev/*"
    "https://<YOUR_APP_DOMAIN>/*", // e.g. "https://XXXXXX.com/*" (Required when in production)
    "https://<YOUR_CLERK_PRODUCTION_FRONTEND_API_GOES_HERE>/*" // e.g. "https://clerk.XXXXXX.com/*" (Required when in production)
  ]
}
```

Your Frontend API URL can be found in [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys) under the **Show API URLs** option.
