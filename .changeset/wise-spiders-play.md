---
'@clerk/chrome-extension': major
---

#### Permission Updates (BREAKING)

The `storage` entry in `host_permissions` is now required for all extensions.
While it's likely that this is already enabled in your extension, this change is to ensure that Clerk can store the necessary data for the extension to function properly.

**How to Update:** Add the following to your `manifest.json` file:

```json
{
  "host_permissions": ["storage"]
}
```

#### Introducing `syncHost` (BREAKING)

In an effort to make the handling of sync hosts more deterministic, we have introduced a new parameter `syncHost` to `<ClerkProvider>`

**How to Update:** Replace `syncSessionWithTab` with `syncHost` in the `<ClerkProvider>` component and set `syncHost` to the host that you intend to synchronize with.

#### Service Workers `createClerkClient`

We've introduced a new method `createClerkClient` to handle background tasks in your extension!

```ts
import { createClerkClient } from '@clerk/chrome-extension/background';

// Create a new Clerk instance and get a fresh token for the user
async function getToken() {
  const clerk = await createClerkClient({
    publishableKey: process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
  return await clerk.session?.getToken();
}

// Create a listener to listen for messages from content scripts
// NOTE: A runtime listener cannot be async.
//       It must return true, in order to keep the connection open and send a response later.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // You can use the token in the listener to perform actions on behalf of the user
  // OR send the token back to the content script
  getToken().then(token => sendResponse({ token }));
  return true;
});
```
