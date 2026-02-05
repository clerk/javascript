import { buildClerkJSScriptAttributes, clerkJSScriptUrl, clerkUIScriptUrl } from '@clerk/react/internal';
import React from 'react';

import { getNonce } from './utils';

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

  const opts = {
    publishableKey,
    clerkJSUrl,
    clerkJSVersion,
    clerkUIUrl,
    nonce,
    domain,
    proxyUrl,
  };

  const scriptUrl = clerkJSScriptUrl(opts);
  const attributes = buildClerkJSScriptAttributes(opts);

  return (
    <>
      <script
        src={scriptUrl}
        data-clerk-js-script
        async
        crossOrigin='anonymous'
        {...attributes}
      />
      {/* Use <link rel='preload'> instead of <script> for the UI bundle.
          This tells the browser to download the resource immediately (high priority)
          but doesn't execute it, avoiding race conditions with __clerkSharedModules
          registration (which happens when React code runs @clerk/ui/register).
          When loadClerkUIScript() later adds a <script> tag, the browser uses the
          cached resource and executes it without re-downloading. */}
      {prefetchUI !== false && (
        <link
          rel='preload'
          href={clerkUIScriptUrl(opts)}
          as='script'
          crossOrigin='anonymous'
          nonce={nonce}
        />
      )}
    </>
  );
}
