import { __unstable__createClerkClient } from '@clerk/chrome-extension/background';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('TESTING onInstalled');
});

async function getToken() {
  const clerk = await __unstable__createClerkClient({
    publishableKey,
    syncSessionWithTab: true,
  });
  return await clerk.session?.getToken();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ? `from a content script: ${sender.tab.url}` : 'from the extension');

  if (request.greeting === 'hello') {
    getToken().then(token => {
      console.log('Background Token:', token);
      sendResponse({ token });
    });
  }

  return true;
});
