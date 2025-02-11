---
'@clerk/clerk-expo': patch
---

Accept custom `redirectURL` for SSO callback via `startSSOFlow`

Usage:

```ts
await startSSOFlow({
  strategy: "oauth_google",
  redirectUrl: AuthSession.makeRedirectUri({
    path: "dashboard"
  }),
});
```
