import { buildClerkJSScriptAttributes, clerkJSScriptUrl, clerkUIScriptUrl } from '@clerk/shared/loadClerkJsScript';
import React from 'react';

type ClerkScriptTagsProps = {
  publishableKey: string;
  __internal_clerkJSUrl?: string;
  __internal_clerkJSVersion?: string;
  __internal_clerkUIUrl?: string;
  nonce?: string;
  domain?: string;
  proxyUrl?: string;
  prefetchUI?: boolean;
};

/**
 * Pure component that renders the Clerk script tags.
 * Shared between `ClerkScripts` (client, app router) and `DynamicClerkScripts` (server).
 * No hooks or client-only imports — safe for both server and client components.
 */
export function ClerkScriptTags(props: ClerkScriptTagsProps) {
  const {
    publishableKey,
    __internal_clerkJSUrl,
    __internal_clerkJSVersion,
    __internal_clerkUIUrl,
    nonce,
    domain,
    proxyUrl,
    prefetchUI,
  } = props;

  const opts = {
    publishableKey,
    __internal_clerkJSUrl,
    __internal_clerkJSVersion,
    __internal_clerkUIUrl,
    nonce,
    domain,
    proxyUrl,
  };

  return (
    <>
      <script
        src={clerkJSScriptUrl(opts)}
        data-clerk-js-script
        async
        crossOrigin='anonymous'
        {...buildClerkJSScriptAttributes(opts)}
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
