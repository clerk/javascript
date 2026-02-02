---
'@clerk/react': major
'@clerk/nextjs': major
'@clerk/react-router': major
'@clerk/tanstack-react-start': minor
'@clerk/shared': patch
---

`useAuth().getToken` is no longer `undefined` during server-side rendering, it is a function and calling it will throw.

* If you are only using `getToken` in `useEffect`, event handlers or with non-suspenseful data fetching libraries, no change is necessary as these only trigger on the client.
* If you are using suspenseful data fetching libraries that do trigger during SSR, you likely have strategies in place to avoid calling `getToken` already, since this has never been possible.
* If you are using `getToken === undefined` checks to avoid calling it, know that it will now throw instead and you should catch and handle the error.

```tsx
async function doThingWithToken(getToken: GetToken) {
  try {
    const token = await getToken();

    // Use token
  } catch (error) {
    if (isClerkRuntimeError(error) && error.code === 'clerk_runtime_not_browser') {
      // Handle error
    }
  }
}
```

To access auth data server-side, see the [`Auth` object reference doc](https://clerk.com/docs/reference/backend/types/auth-object).















```tsx
const { getToken } = useAuth();

useEffect(() => {
  if (getToken) {
    getToken().then(token => {
      // Use the token
    })
  }
});
```

```tsx
const { getToken } = useAuth();

useEffect(() => {
  getToken
    .then(() => {
      // Use the token
    })
    .catch((error) => {
      if (isClerkRuntimeError(error) && error.code === 'clerk_runtime_not_browser') {
        // Handle or ignore the error
      }
    });  
});
```
