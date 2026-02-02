---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add Safari ITP (Intelligent Tracking Prevention) cookie refresh support.

Safari's ITP limits cookies set via JavaScript to 7 days. When a session cookie is close to expiring (within 8 days), Clerk now automatically routes navigations through a `/v1/client/touch` endpoint to refresh the cookie via a full-page navigation, bypassing the 7-day cap.

For developers using a custom `navigate` callback in `setActive()`, a new `decorateUrl` function is passed to the callback. Use it to wrap your destination URL:

```ts
await clerk.setActive({
  session: newSession,
  navigate: ({ decorateUrl }) => {
    const url = decorateUrl('/dashboard');
    window.location.href = url;
  },
});
```

The `decorateUrl` function returns the original URL unchanged when the Safari ITP fix is not needed, so it's safe to always use it.
