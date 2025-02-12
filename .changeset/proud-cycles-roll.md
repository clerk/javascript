---
'@clerk/clerk-js': minor
'@clerk/elements': patch
'@clerk/shared': patch
'@clerk/astro': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
'@clerk/vue': patch
---

### @clerk/clerk-js

- Introduce a new client session status: `pending`
- Handle and initialize a `pending` session as an authenticated state, similarity as `active`

[TODO - Add more details here on DX changes such as `activeSessions` deprecation after tacking code review feedback]

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
