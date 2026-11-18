---
'@clerk/astro': patch
---

Fix `clerkMiddleware` so it adds Clerk's tags to the page once, right before the closing `</head>` tag. It now finds that tag even when a streamed response splits it across two chunks. The server data now goes in `<meta>` tags, and clerk-js is preloaded with a `<link>` tag and loaded by the integration's page script.
