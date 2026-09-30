---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add an experimental `webmcp` option (`experimental: { webmcp: true }`). In browsers that support [WebMCP](https://webmachinelearning.github.io/webmcp/), Clerk registers tools that let browser agents check auth state, sign in, submit verification codes, switch organizations and sign out, without ever taking a password or returning a token. Each tool call dispatches a `clerk:webmcp` event on `window` with the tool name, result status and sign-in strategy, so you can track agent activity in your own analytics.
