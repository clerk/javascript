---
title: 'Sign-in Client Trust status handling'
matcher:
  - 'attemptFirstFactor'
  - 'password'
matcherLogic: 'and'
category: 'breaking'
---

We've add a new Sign-in status of `needs_client_trust` which, given the conditions listed below, will need to be handled in your application.

Prerequisites:

- Client Trust is enabled. [TODO: Link]
- You've opted-in to the Client Trust `needs_client_trust` Update. [TODO: Links]
- Sign-in with Email and/or Phone identifiers are enabled. [TODO: Links]
- If Email or SMS sign-in verification aren't enabled. [TODO: Links]

Example change:

```diff
- const { signIn } = useSignIn()
- signIn.attemptFirstFactor({ strategy: 'password', password: '...' })
- if (signIn.status === 'complete') {/* ... */ }
+ const { signIn } = useSignIn()
+ signIn.attemptFirstFactor({ strategy: 'password', password: '...' })
+ if (signIn.status === 'needs_client_trust') { /* ... */ }
+ else if (signIn.status === 'complete') { /* ... */ }
```
