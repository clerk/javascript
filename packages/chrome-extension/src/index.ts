// Override Clerk React error thrower to show that errors come from @clerk/chrome-extension
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
import type { DeclarativeNetRequest } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });

browser.runtime.onInstalled.addListener(() => {
  const rules: DeclarativeNetRequest.Rule[] = [
    {
      id: 654321,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{ header: 'Origin', operation: 'remove' }],
      },
      condition: {
        initiatorDomains: [browser.runtime.id],
        isUrlFilterCaseSensitive: true,
        regexFilter: '.+(?|&)*_is_native=1.*',
        requestMethods: ['post', 'put', 'delete'],
        resourceTypes: ['xmlhttprequest'],
      },
    },
  ];

  void browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules,
  });
});

export * from '@clerk/clerk-react';
export type { StorageCache } from './utils/storage';

// The order matters since we want override @clerk/clerk-react ClerkProvider
export { ClerkProvider } from './ClerkProvider';
