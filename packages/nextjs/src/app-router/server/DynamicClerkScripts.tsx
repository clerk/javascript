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
  clerkJSUrl?: string;
  clerkJSVersion?: string;
  clerkUIUrl?: string;
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
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkUIUrl, domain, proxyUrl, prefetchUI } = props;

  if (!publishableKey) {
    return null;
  }

  const nonce = await getNonce();

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
