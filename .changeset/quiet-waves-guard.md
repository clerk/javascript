---
'@clerk/nextjs': patch
---

Make `@clerk/nextjs` ESM-safe for non-Node.js runtimes like Cloudflare Workers (vinext). Replaces `require('server-only')`, `require('node:fs')`, and `require('next/navigation')` with ESM-compatible alternatives.
