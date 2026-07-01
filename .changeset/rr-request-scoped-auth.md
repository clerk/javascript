---
'@clerk/react-router': patch
---

Fixed a potential cross-user auth leak when the React Router `context` is reused across requests (for example with a custom server, a shared `getLoadContext`, or a serverless adapter that reuses context on warm instances). `getAuth()` and `rootAuthLoader()` now resolve authentication per request instead of reading a value cached on the context.
