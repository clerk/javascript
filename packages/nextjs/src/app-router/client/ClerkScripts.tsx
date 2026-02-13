import { useClerk } from '@clerk/react';
import React from 'react';

import { useClerkNextOptions } from '../../client-boundary/NextOptionsContext';
import { ClerkScriptTags } from '../../utils/clerk-script-tags';

export function ClerkScripts() {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkUIUrl, nonce, prefetchUI } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  if (!publishableKey) {
    return null;
  }

  return (
    <ClerkScriptTags
      publishableKey={publishableKey}
      clerkJSUrl={clerkJSUrl}
      clerkJSVersion={clerkJSVersion}
      clerkUIUrl={clerkUIUrl}
      nonce={nonce}
      domain={domain}
      proxyUrl={proxyUrl}
      prefetchUI={prefetchUI}
    />
  );
}
