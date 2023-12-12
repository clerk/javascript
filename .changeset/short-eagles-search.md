---
'@clerk/chrome-extension': minor
'@clerk/clerk-js': minor
'@clerk/backend': minor
'@clerk/nextjs': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Introduce Protect for authorization.
Changes in public APIs:
- Rename Gate to Protect
- Support for permission checks. (Previously only roles could be used)
- Remove the `experimental` tags and prefixes
- Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
- Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
- `has` will throw an error if neither `permission` or `role` is passed.
- `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
  - inside a page or layout file it will render the nearest `not-found` component set by the developer
  - inside a route handler it will return empty response body with a 404 status code
