---
'@clerk/electron': minor
'@clerk/clerk-js': patch
---

Add an `http` loopback redirect strategy for native OAuth, alongside the existing (default) custom-scheme deep link.

The `http` strategy receives the OAuth callback on `http://127.0.0.1:<port>` and serves a completion page, so the system browser tab resolves instead of stalling on a custom-scheme redirect — and it needs no OS protocol registration (RFC 8252 §7.3).

The redirect is configured as a discriminated union on `createClerkBridge`, with `httpRedirectStrategy` / `deepLinkRedirectStrategy` helpers:

```ts
import { createClerkBridge, httpRedirectStrategy } from '@clerk/electron';

createClerkBridge({
  storage: storage(),
  renderer: { scheme: 'my-app', host: 'app' },
  // default: { type: 'deep-link' }
  oauth: {
    redirect: httpRedirectStrategy({
      port: 45789, // default
      successUrl: 'https://myapp.com/signed-in', // optional: 302 the browser to your own page
      // successHtml: '<h1>Signed in</h1>',      // optional alternative: custom page
    }),
  },
});
```

For `{ type: 'http' }`, add `http://127.0.0.1:<port>/sso-callback` (default port `45789`) to your instance's allowed redirect URLs. `successUrl` must be an absolute `http(s)` URL (it loads in the system browser); `successUrl` and `successHtml` are mutually exclusive. The default `{ type: 'deep-link' }` keeps the custom-scheme behavior (`scheme://host/`; requires `renderer`).

In `@clerk/clerk-js`, the native OAuth transport now uses the transport's redirect URL for both `redirect_url` and `action_complete_redirect_url`, so the browser's final (action-complete) redirect returns to the transport listener instead of an in-app URL.
