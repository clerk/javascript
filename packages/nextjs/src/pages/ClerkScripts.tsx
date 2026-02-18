import { useClerk } from '@clerk/react';
import { buildClerkJSScriptAttributes, clerkJSScriptUrl, clerkUIScriptUrl } from '@clerk/react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

function ClerkScript(props: { scriptUrl: string; attributes: Record<string, string>; dataAttribute: string }) {
  const { scriptUrl, attributes, dataAttribute } = props;

  return (
    <NextScript
      src={scriptUrl}
      {...{ [dataAttribute]: true }}
      async
      // `nextjs/script` will add defer by default and does not get removed when async is true
      defer={false}
      crossOrigin='anonymous'
      strategy='beforeInteractive'
      {...attributes}
    />
  );
}

export function ClerkScripts() {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkUIUrl, nonce, prefetchUI, ui } =
    useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  if (!publishableKey) {
    return null;
  }

  const opts = {
    publishableKey,
    clerkJSUrl,
    clerkJSVersion,
    clerkUIUrl,
    nonce,
    domain,
    proxyUrl,
  };

  return (
    <>
      <ClerkScript
        scriptUrl={clerkJSScriptUrl(opts)}
        attributes={buildClerkJSScriptAttributes(opts)}
        dataAttribute='data-clerk-js-script'
      />
      {/* Use <link rel='preload'> instead of <script> for the UI bundle.
          This tells the browser to download the resource immediately (high priority)
          but doesn't execute it, avoiding race conditions with __clerkSharedModules
          registration (which happens when React code runs @clerk/ui/register).
          When loadClerkUIScript() later adds a <script> tag, the browser uses the
          cached resource and executes it without re-downloading.
          Skip preload when ui prop is passed - the bundled UI will be used instead. */}
      {prefetchUI !== false && !ui && (
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
