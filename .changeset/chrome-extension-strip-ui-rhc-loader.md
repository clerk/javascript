---
'@clerk/chrome-extension': patch
---

Strip the remotely-hosted `@clerk/ui` script loader from the bundle. The extension SDK already ships Clerk UI bundled via `@clerk/ui/no-rhc`, but the CDN loader for `ui.browser.js` (a dynamically injected `<script>` tag) remained in the build as unreachable code. The Chrome Web Store rejects this under Manifest V3's prohibition on remotely hosted code even though it never runs. It is now removed at build time.
