---
title: '`setSession` -> `setActive`'
matcher: 'setSession'
---

`setSession` should be replaced with `setActive`. The format of the parameters has changed slightly - `setActive` takes an object where `setSession` took params directly. The `setActive` function also can accept an `organization` param that is used to set the currently active organization. The return signature did not change. Read the [API documentation](/docs/references/javascript/clerk/session-methods#set-active) for more detail. This function should be expected to be returned from one of the following Clerk hooks: `useSessionList`, `useSignUp`, or `useSignIn`. Some migration examples:

```diff
- await setSession('sessionID', () => void)
+ await setActive({ session: 'sessionID',  beforeEmit: () => void })

- await setSession(sessionObj)
+ await setActive({ session: sessionObj })

- await setSession(sessionObj, () => void)
+ await setActive({ session: sessionObj,  beforeEmit: () => void })
```

`setActive` also supports setting an active organization:

```js
await setActive({
  session: 'sessionID',
  organization: 'orgID',
  beforeEmit: () => void
})

await setActive({
  session: sessionObj,
  organization: orgObj,
  beforeEmit: () => void
})
```
