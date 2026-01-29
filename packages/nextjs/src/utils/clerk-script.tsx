import { useClerk } from '@clerk/react';
import {
  buildClerkJSScriptAttributes,
  clerkJSScriptUrl,
  clerkUIScriptUrl,
  shouldPrefetchClerkUI,
} from '@clerk/react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

type ClerkScriptProps = {
  scriptUrl: string;
  attributes: Record<string, string>;
  dataAttribute: string;
  router: 'app' | 'pages';
};

function ClerkScript(props: ClerkScriptProps) {
  const { scriptUrl, attributes, dataAttribute, router } = props;

  /**
   * Notes:
   * `next/script` in 13.x.x when used with App Router will fail to pass any of our `data-*` attributes, resulting in errors
   * Nextjs App Router will automatically move inline scripts inside `<head/>`
   * Using the `nextjs/script` for App Router with the `beforeInteractive` strategy will throw an error because our custom script will be mounted outside the `html` tag.
   */
  const Script = router === 'app' ? 'script' : NextScript;

  return (
    <Script
      src={scriptUrl}
      {...{ [dataAttribute]: true }}
      async
      // `nextjs/script` will add defer by default and does not get removed when async is true
      defer={router === 'pages' ? false : undefined}
      crossOrigin='anonymous'
      strategy={router === 'pages' ? 'beforeInteractive' : undefined}
      {...attributes}
    />
  );
}

export function ClerkScripts({ router }: { router: ClerkScriptProps['router'] }) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkUIUrl, nonce, prefetchUI } = useClerkNextOptions();
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
        router={router}
      />
      {/* Use <link rel='preload'> instead of <script> for the UI bundle.
          This pre-fetches for performance but doesn't execute immediately,
          avoiding race conditions with __clerkSharedModules registration
          (which happens when React code runs @clerk/ui/register).
          The actual execution happens via loadClerkUIScript() in isomorphicClerk. */}
      {shouldPrefetchClerkUI(prefetchUI) && (
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
