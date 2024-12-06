import { useClerk } from '@clerk/clerk-react';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/clerk-react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

type ClerkJSScriptProps = {
  router: 'app' | 'pages';
};

function ClerkJSScript(props: ClerkJSScriptProps) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();
  const options = {
    domain,
    proxyUrl,
    publishableKey: publishableKey!,
    clerkJSUrl,
    clerkJSVersion,
    clerkJSVariant,
    nonce,
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
  );
}

export { ClerkJSScript };
