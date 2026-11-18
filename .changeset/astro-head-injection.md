---
'@clerk/astro': patch
---

Fix `clerkMiddleware` so it inserts Clerk's tags only before the document's real `</head>` tag. It no longer matches `</head>` inside attribute values, comments, or the text of elements like `script`, `style`, `textarea`, `title`, and `noscript`, and it now finds a `</head>` tag that is split across streamed chunks. The server data now goes in `<meta>` tags, and clerk-js is preloaded with a `<link>` tag and loaded by the integration's page script.
