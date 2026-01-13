---
title: '`getToken` `leewayInSeconds` renamed to `backgroundRefreshThreshold`'
matcher:
  - 'leewayInSeconds'
  - 'backgroundRefreshThreshold'
  - 'getToken'
category: 'behavior-change'
warning: true
---

The `leewayInSeconds` option in `session.getToken()` has been renamed to `backgroundRefreshThreshold` for clarity. This option controls when background token refresh is triggered before expiration.

### What changed?

1. **Renamed option**: `leewayInSeconds` → `backgroundRefreshThreshold`
2. **Lower minimum**: The minimum value is now 5 seconds (the poller interval) instead of 15 seconds
3. **Clearer semantics**: The new name better describes what the option does

### Migration

```js
// Before
const token = await session.getToken({ leewayInSeconds: 30 });

// After
const token = await session.getToken({ backgroundRefreshThreshold: 30 });
```

### How it works

When a token's remaining TTL falls below the `backgroundRefreshThreshold`, `getToken()` returns the cached token immediately while triggering a background refresh.

- **Minimum value**: 5 seconds (the poller interval)
- **Default value**: 15 seconds

```
Token TTL Timeline
──────────────────────────────────────────────────────►
                                                     expires

│←── Fresh zone ──→│←── Background refresh ──→│←─ Sync ─→│
    (no refresh)       (SWR: return + refresh)   (force)

   > threshold           5s - threshold           < 5s
```

### Rate Limiting Warning

Setting `backgroundRefreshThreshold` higher than the default triggers earlier background refresh. While this can reduce latency for time-sensitive operations, values that are too high may cause excessive token refresh requests and potentially trigger rate limiting.

```js
// Use with caution - triggers refresh 30s before expiration
const token = await session.getToken({ backgroundRefreshThreshold: 30 });
```
