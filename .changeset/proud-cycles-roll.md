---
'@clerk/clerk-js': minor
---

- Initialize new `pending` session status as an signed-in state
- Deprecate `Clerk.client.activeSessions` in favor of `Clerk.client.signedInSessions`
- Introduce `Clerk.isSignedIn` property as an explicit signed-in state check, instead of `!!Clerk.session` or `!!Clerk.user`:

```ts
- if (Clerk.user) {
+ if (Clerk.isSignedIn) {
  // Mount user button component
  document.getElementById('signed-in').innerHTML = `
    <div id="user-button"></div>
  `

  const userbuttonDiv = document.getElementById('user-button')

  clerk.mountUserButton(userbuttonDiv)
}
