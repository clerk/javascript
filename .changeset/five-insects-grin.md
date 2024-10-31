---
"@clerk/nextjs": minor
"@clerk/clerk-react": minor
---

Introduce a new experimental hook called `useReverification` that makes it easy to handle reverification errors.
It returns a high order function (HOF) and allows developers to wrap any function that triggers a fetch request which might fail due to a user's session verification status.
When such error is returned, the recommended UX is to offer a way to the user to recover by re-verifying their credentials.
This helper will automatically handle this flow in the developer's behalf, by displaying a modal the end-user can interact with.
Upon completion, the original request that previously failed, will be retried (only once).

Example with clerk-js methods.
```tsx
import { __experimental_useReverification as useReverification } from '@clerk/nextjs';

function DeleteAccount() {
  const { user } = useUser();
  const [deleteUserAccount] = useReverification(() => {
    if (!user) return;
    return user.delete()
  });
  
  return <>
      <button
        onClick={async () => {
            await deleteUserAccount();
        }}>
        Delete account
      </button>
  </>
}

```
