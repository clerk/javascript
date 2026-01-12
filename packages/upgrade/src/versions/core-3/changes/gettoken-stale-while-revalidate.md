---
title: '`getToken` now uses stale-while-revalidate pattern'
matcher:
  - 'getToken'
  - 'session\.getToken'
category: 'behavior-change'
warning: true
---

`session.getToken()` now implements a stale-while-revalidate pattern that improves performance by returning cached tokens immediately while refreshing them in the background when they're close to expiration.

### How it works

1. When a token is within 15 seconds of expiration (configurable via `leewayInSeconds`), `getToken()` returns the valid cached token immediately
2. A background refresh is triggered automatically to fetch a fresh token
3. Subsequent calls receive the new token once the background refresh completes

### Benefits

- **Reduced latency**: No more waiting for token refresh on every call near expiration
- **Better user experience**: API calls proceed immediately with valid (though expiring) tokens
- **Automatic refresh**: Fresh tokens are ready before the old ones expire

### Cross-tab synchronization

Token updates are automatically synchronized across browser tabs using `BroadcastChannel`. When one tab refreshes a token, other tabs receive the update automatically.

### Example

```js
// Token is cached and valid but expiring in 10 seconds
// Core 2 behavior: Would block and fetch new token
// Core 3 behavior: Returns cached token immediately, refreshes in background
const token = await session.getToken();
```

### Compatibility

This is a transparent improvement - no code changes are required. Your existing `getToken()` calls benefit automatically.

### Customizing refresh timing

Use `leewayInSeconds` to trigger background refresh earlier (minimum 15 seconds):

```js
// Start background refresh 30 seconds before expiration
const token = await session.getToken({ leewayInSeconds: 30 });
```
