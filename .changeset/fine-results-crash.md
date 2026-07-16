---
'@clerk/electron': patch
---

Validate that token-cache and OAuth-transport IPC requests originate from a top-level window's main frame. This prevents untrusted content in subframes or `<webview>`s that share the Clerk preload from reading the persisted client JWT or driving the OAuth transport.
