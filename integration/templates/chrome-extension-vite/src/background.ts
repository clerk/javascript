import { createClerkClient } from '@clerk/chrome-extension/client';

const PUBLISHABLE_KEY = (globalThis as any).__CLERK_PUBLISHABLE_KEY__ as string;

let clerkPromise: Promise<any> | null = null;

function getClerk() {
  if (!clerkPromise) {
    clerkPromise = createClerkClient({
      publishableKey: PUBLISHABLE_KEY,
      background: true,
    });
  }
  return clerkPromise;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_AUTH') {
    getClerk()
      .then(clerk => {
        sendResponse({
          userId: clerk.user?.id ?? null,
          sessionId: clerk.session?.id ?? null,
        });
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true; // Keep message channel open for async response
  }
});
