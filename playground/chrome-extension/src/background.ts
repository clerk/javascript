import { createClerkClient } from '@clerk/chrome-extension';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('TESTING onInstalled');
});

async function getToken() {
  const clerk = await createClerkClient({ publishableKey, extensionFeatures: { background: true, sync: true } });
  return await clerk.session?.getToken();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ? `from a content script: ${sender.tab.url}` : 'from the extension');

  if (request.greeting === 'hello') {
    getToken().then(token => {
      sendResponse({ token });
    });
  }

  return true;
});
