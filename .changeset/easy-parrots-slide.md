---
'@clerk/testing': minor
---

Introduce new helper to allow signing a user in via email address:

```ts
import { clerk } from '@clerk/testing/playwright'

test('sign in', async ({ page }) => {
  await clerk.signIn({ emailAddress: 'foo@bar.com', page })
})
```
