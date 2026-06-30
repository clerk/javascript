---
'@clerk/electron': patch
---

`<ClerkProvider>` from `@clerk/electron/react` now allows the renderer's own custom scheme as a redirect protocol by default, so apps no longer need to set `allowedRedirectProtocols={['<scheme>:']}` manually.

This applies when the renderer is served from the custom scheme registered with `createClerkBridge({ renderer })`. Local `file:` renderers are not allowlisted automatically, and explicit `allowedRedirectProtocols` values are still respected.
