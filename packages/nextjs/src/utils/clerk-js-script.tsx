import { useClerk } from '@clerk/clerk-react';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/clerk-react/internal';
// import NextHead from 'next/head';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

type ClerkJSScriptProps = {
  router: 'app' | 'pages';
};

function ClerkJSScript(props: ClerkJSScriptProps) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();
  const options = {
    domain,
    proxyUrl,
    publishableKey: publishableKey!,
    clerkJSUrl,
    clerkJSVersion,
    clerkJSVariant,
  };
  const scriptUrl = clerkJsScriptUrl(options);

  /**
   * Notes:
   * `next/script` in 13.x.x when used with App Router will fail to pass any of our `data-*` attributes, resulting in errors
   * Nextjs App Router will automatically move inline scripts inside `<head/>`
   * Using the `nextjs/script` for App Router with the `beforeInteractive` strategy will throw an error because our custom script will be mounted outside the `html` tag.
   */
  const Script = props.router === 'app' ? 'script' : NextScript;

  return (
    <>
      {/*<NextHead>*/}
      {/*  <title>NICE</title>*/}
      {/*  <link*/}
      {/*    rel='preload'*/}
      {/*    href='https://immortal-cockatoo-38.clerk.accounts.dev/v1/client?_clerk_js_version=5.2.1&__clerk_db_jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMmZ2UFJuU1VoVURudHVZZTFJc0w0Skt3c1RJIn0.E2pc_3ER2JqQ4CB_bLPtJQpAjReuK7rweMyCKJTTlkzleUOexYjB27977R-RoX5NrJU3jQCeDdYWsGfyubrvATcrB5TfA6B9F5UC_ROtBvBhU-RlSRv6Dq3HTWnFngg8YzW69nVDHv1Q-qSQZoBxVkHCHnNiHlDybfmjvxx0MzTikqR3kOjooiHvB9XdwPYCOWSEQ6lmK441KUhc2fEAVT9_TUG3mzsg4UIvSecORjpJhnMSKwrTwF8zmEL9pktDSNV0J-feHJZxAA4iLMA_rOz_fOf6Ytl0ZvID9h3WffFvNlJOVlom_2CZW9VGFrnUVnKkq2G3xqSMTJ-kk5X7LQ'*/}
      {/*    as='fetch'*/}
      {/*    crossOrigin={'anonymous'}*/}
      {/*  />*/}
      {/*</NextHead>*/}
      <Script
        src={scriptUrl}
        data-clerk-js-script
        async
        // `nextjs/script` will add defer by default and does not get removed when we async is true
        defer={props.router === 'pages' ? false : undefined}
        crossOrigin='anonymous'
        strategy={props.router === 'pages' ? 'beforeInteractive' : undefined}
        {...buildClerkJsScriptAttributes(options)}
      />
    </>
  );
}

export { ClerkJSScript };
