---
'@clerk/nextjs': minor
---
Tweaked the default `authMiddleware` behavior for protected API routes. An unauthenticated request for a protected API route will no longer return a `307 Redirect` - a `401 Unauthorized` response will be returned instead. 
With this change, an API route is considered a request for which the following rules apply:
- The request url matches the following patterns; `['/api/(.*)', '/trpc/(.*)']`
- Or, the request has `Content-Type: application/json`
- Or, the request method is not one of: `GET`, `OPTIONS` ,` HEAD`

A new `apiRoutes` param has been introduced on `authMiddleware`. It can accept an array of path patterns, `RegexExp` or strings. If `apiRoutes` is passed in explicitly, then it overrides the behavior described above and only the requests matching `apiRoutes` will be considered as API routes requests.
  For more technical details, refer to the PR's description.
