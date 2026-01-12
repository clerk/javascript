---
title: '`getToken` `leewayInSeconds` has 15s minimum'
matcher:
  - 'leewayInSeconds'
  - 'getToken'
category: 'behavior-change'
warning: true
---

The `leewayInSeconds` option in `session.getToken()` now has a minimum enforced value of 15 seconds. Values below this threshold are ignored and the minimum is used instead.

This threshold ensures reliable token refresh by accounting for timer jitter, network latency, and background task contention.

### Why this change?

Setting `leewayInSeconds` too low could result in tokens expiring before background refresh completes, causing authentication failures. The 15-second minimum provides a safety buffer.

### Impact

If you were using `leewayInSeconds` with a value less than 15 seconds:

```js
// Before: 5s leeway (now enforced as 15s minimum)
const token = await session.getToken({ leewayInSeconds: 5 });

// After: Behaves as if leewayInSeconds: 15 was passed
```

### Rate Limiting Warning

Setting `leewayInSeconds` higher than the default (15s) triggers earlier background token refresh. While this can reduce latency for time-sensitive operations, values that are too high may cause excessive token refresh requests and potentially trigger rate limiting.

```js
// Use with caution - triggers refresh 60s before expiration
const token = await session.getToken({ leewayInSeconds: 60 });
```

No code changes are required unless you want to adjust the refresh timing.
