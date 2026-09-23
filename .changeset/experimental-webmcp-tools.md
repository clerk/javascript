---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add an experimental `webmcp` option (`experimental: { webmcp: true }`). In browsers that support [WebMCP](https://webmachinelearning.github.io/webmcp/), Clerk registers tools that let browser agents check auth state, sign in, submit verification codes, switch organizations and sign out. The tools never take a password or return a token; password and passkey sign-in go through the browser's own prompts.
