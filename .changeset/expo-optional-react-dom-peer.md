---
'@clerk/expo': patch
---

Make `react-dom` an optional peer dependency so native Expo apps can install Clerk without pulling in a React DOM version they do not use.
