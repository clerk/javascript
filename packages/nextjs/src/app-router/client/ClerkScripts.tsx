import { useClerk } from '@clerk/react';
import React from 'react';

import { useClerkNextOptions } from '../../client-boundary/NextOptionsContext';
import { ClerkScriptTags } from '../../utils/clerk-script-tags';

export function ClerkScripts() {
  const {
    publishableKey,
    __internal_clerkJSUrl,
    __internal_clerkJSVersion,
    __internal_clerkUIUrl,
    __internal_clerkUIVersion,
    nonce,
    prefetchUI,
  } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  if (!publishableKey) {
    return null;
  }

  return (
    <ClerkScriptTags
      publishableKey={publishableKey}
      __internal_clerkJSUrl={__internal_clerkJSUrl}
      __internal_clerkJSVersion={__internal_clerkJSVersion}
      __internal_clerkUIUrl={__internal_clerkUIUrl}
      __internal_clerkUIVersion={__internal_clerkUIVersion}
      nonce={nonce}
      domain={domain}
      proxyUrl={proxyUrl}
      prefetchUI={prefetchUI}
    />
  );
}
