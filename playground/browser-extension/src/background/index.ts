import { createClerkClient } from '@clerk/chrome-extension/background';

console.log('Background Script w/ Clerk createClerkClient() demo loaded')

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
if (!publishableKey) {
  throw new Error('Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file')
}

async function getToken() {
  const clerk = await createClerkClient({
    publishableKey,
    syncHost: process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST
  });
  return await clerk.session?.getToken();
}

// create a listener to listen for messages from content scripts
// NOTE: A runtime listener cannot be async.
//       It must return true, in order to keep the connection open and send a response later.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "get-token") {
    console.log('Handling request for the user\'s current token')
    getToken().then((token) => sendResponse({ token })).catch((error) => console.error(JSON.stringify(error)));
  }
  return true;
});


