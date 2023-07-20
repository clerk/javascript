---
'@clerk/clerk-react': minor
---

Add an `authStateKey` field to the `useAuth` hook so it returns a value that is unique per auth state.

The `authStateKey` is a string value that was derived by hashing the `sessionId`, `userId` and the `orgId`. If any of these change in value, it will result in a completely different hash value. This can be of value if there is a need for caching.


Example with SWR

```jsx

const fetcher = {
    fetch('/user/123')
}

const singleUser = '/user'

useSWR(singleUser, fetcher); // this won't fetch '/user/456'
```

With `authStateKey` this can become
```jsx
const { authStateKey }  = useAuth()

const singleUser = '/user'

useSWR(`${singleUser}?hash=${authStateKey}`, fetcher);

```
This will invalidate the cache if `sessionId`, `userId` or `orgId` changed.
