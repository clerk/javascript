---
title: '`setSession` -> `setActive`'
matcher: 'setSession'
---

This should be replaced with `setActive` instead. The format of the params has changed slightly - `setActive` takes an object where `setSession` took params directly. The `setActive` function also can accept an `organization` param that is used to set the currently active organization. The return signature does not change. See [the documentation](https://clerk.com/docs/references/javascript/clerk/session-methods#set-active) for more detail! This function should be expected to be returned from one of the following clerk hooks: `useSessionList`, `useSignUp`, `useSignIn`. Some before/after examples provided below:

```js
// before
await setSession('sessionID', () => void)
// after
await setActive({ session: 'sessionID',  beforeEmit: () => void })

// before
await setSession(sessionObj)
// after
await setActive({ session: sessionObj })

// before
await setSession(sessionObj, () => void)
// after
await setActive({ session: sessionObj,  beforeEmit: () => void })

// setActive also supports setting the active organization
await setActive({ session: 'sessionID', organization: 'orgID', beforeEmit: () => void })
await setActive({ session: sessionObj, organization: orgObj, beforeEmit: () => void })
```
