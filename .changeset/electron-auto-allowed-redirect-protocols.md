---
'@clerk/electron': patch
---

`<ClerkProvider>` from `@clerk/electron/react` now allows the renderer's own custom scheme as a redirect protocol by default, so apps no longer need to set `allowedRedirectProtocols={['<scheme>:']}` manually.

The renderer is served from the scheme registered via `createClerkBridge({ renderer: { scheme } })` (e.g. `clerk://app`), and Clerk's prebuilt UI renders in-app cross-links (such as "Sign up" on the sign-in card) as absolute anchors against that origin. The provider reads `window.location.protocol` and adds it to clerk-js's redirect allowlist automatically. Standard web protocols (`http`/`https`) are already allowed, so only a custom scheme is added.

An explicit `allowedRedirectProtocols` value is always respected as-is — including an empty array — so you can fully override the default.
