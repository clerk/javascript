---
'@clerk/backend': patch
'@clerk/nextjs': patch
---

The `auth().redirectToSignIn()` helper no longer needs to be explicitly returned when called within the middleware. The following examples are now equivalent:

```js
// Before
export default clerkMiddleware(auth => {
  if (protectedRoute && !auth.user) {
    return auth().redirectToSignIn()
  }
})

// After
export default clerkMiddleware(auth => {
  if (protectedRoute && !auth.user) {
    auth().redirectToSignIn()
  }
})
```

Calling `auth().protect()` from a page will now automatically redirect back to the same page by setting `redirect_url` to the request url before the redirect to the sign-in URL takes place.
