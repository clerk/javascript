---
'@clerk/chrome-extension': minor
---

Update export for Chrome Extension background jobs to align with SDK specs

Example Usage:

```ts
import { __unstable__createClerkClient } from '@clerk/chrome-extension/background';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

async function getToken() {
  const clerk = await __unstable__createClerkClient({ publishableKey /*, syncSessionWithTab: true */ });
  return await clerk.session?.getToken();
}

// NOTE: A runtime listener cannot be async.
//       It must return true, in order to keep the connection open and send a response later.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  getToken().then(token => sendResponse({ token }));
  return true;
});
```
