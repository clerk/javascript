import { headers } from 'next/headers';
import React from 'react';

import { ClerkScriptTags } from '../../utils/clerk-script-tags';
import { getScriptNonceFromHeader, isPrerenderingBailout } from './utils';

async function getNonce(): Promise<string> {
  try {
    const headersList = await headers();
    const nonce = headersList.get('X-Nonce');
    return nonce
      ? nonce
      : // Fallback to extracting from CSP header
        getScriptNonceFromHeader(headersList.get('Content-Security-Policy') || '') || '';
  } catch (e) {
    if (isPrerenderingBailout(e)) {
      throw e;
    }
    // Graceful degradation — scripts load without nonce
    return '';
  }
}

type DynamicClerkScriptsProps = {
  publishableKey: string;
  __internal_clerkJSUrl?: string;
  __internal_clerkJSVersion?: string;
  __internal_clerkUIUrl?: string;
  __internal_clerkUIVersion?: string;
  domain?: string;
  proxyUrl?: string;
  prefetchUI?: boolean;
};

/**
 * Server component that fetches nonce from headers and renders Clerk scripts.
 * This component should be wrapped in a Suspense boundary to isolate the dynamic
 * nonce fetching from the rest of the page, allowing static rendering/PPR to work.
 */
export async function DynamicClerkScripts(props: DynamicClerkScriptsProps) {
  const {
    publishableKey,
    __internal_clerkJSUrl,
    __internal_clerkJSVersion,
    __internal_clerkUIUrl,
    __internal_clerkUIVersion,
    domain,
    proxyUrl,
    prefetchUI,
  } = props;

  if (!publishableKey) {
    return null;
  }

  const nonce = await getNonce();

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
