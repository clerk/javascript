---
'@clerk/clerk-js': minor
---

- Initialize new `pending` session status as an signed-in state
- Add new `Clerk.isSignedIn` property to provide a more explicit way to check authentication status, replacing the previous `Clerk.user` check

```diff
- if (Clerk.user) {
+ if (Clerk.isSignedIn) {
  // Mount user button component
  document.getElementById('signed-in').innerHTML = `
    <div id="user-button"></div>
  `

  const userbuttonDiv = document.getElementById('user-button')

  clerk.mountUserButton(userbuttonDiv)
} else {
 // ...
}
```
