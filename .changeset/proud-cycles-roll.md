---
'@clerk/clerk-js': minor
---

- Introduce a new client session status: `pending`
- Initialize a `pending` session as an authenticated state

```diff
- if (Clerk.user) {
+ if (clerk.hasAuthenticatedClient) {
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
