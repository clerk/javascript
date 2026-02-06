import { useClerk } from '@clerk/react';
import { buildClerkJSScriptAttributes, clerkJSScriptUrl, clerkUIScriptUrl } from '@clerk/react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';
import { ClerkScriptTags } from './clerk-script-tags';

type ClerkScriptProps = {
  scriptUrl: string;
  attributes: Record<string, string>;
  dataAttribute: string;
};

function ClerkScript(props: ClerkScriptProps) {
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

export function ClerkScripts({ router }: { router: 'app' | 'pages' }) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkUIUrl, nonce, prefetchUI } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  if (!publishableKey) {
    return null;
  }

  if (router === 'app') {
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
