---
"@clerk/expo": patch
---

fix(expo): use `require.resolve` in config plugin to find `ClerkViewFactory.swift`, resolving failures in pnpm workspaces nested 2+ levels deep
