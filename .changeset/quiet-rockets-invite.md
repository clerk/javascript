---
'@clerk/nextjs': patch
---

Improve support for apps that opt-in to using Next.js Cache Components by wrapping `<ClerkProvider>` in a `<Suspense>` boundary when rendered by a Cache Component.
