### Service Workers (Experimental)

You can also use service workers in the your extension to handle background tasks.

```ts
import { createClerkClient } from '@clerk/chrome-extension/background';

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST; // OPTIONAL

async function getToken() {
  const clerk = await createClerkClient({
    publishableKey: PUBLISHABLE_KEY,
    syncHost: SYNC_HOST, // OPTIONAL: Add if you want to sync with a host, similarly to the provider above.
  });
  return await clerk.session?.getToken();
}

// NOTE: A runtime listener cannot be async.
//       It must return true, in order to keep the connection open and send a response later.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // You can use the token in the listener to perform actions on behalf of the user
  // OR send the token back to the content script
  getToken().then(token => sendResponse({ token }));
  return true;
});
```
