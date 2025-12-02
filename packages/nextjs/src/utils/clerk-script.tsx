import { useClerk } from '@clerk/react';
import {
  buildClerkJsScriptAttributes,
  buildClerkUiScriptAttributes,
  clerkJsScriptUrl,
  clerkUiScriptUrl,
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
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce, clerkUiUrl, ui } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  if (!publishableKey) {
    return null;
  }

  const opts = {
    publishableKey,
    clerkJSUrl,
    clerkJSVersion,
    clerkJSVariant,
    nonce,
    domain,
    proxyUrl,
    clerkUiVersion: ui?.version,
    clerkUiUrl: ui?.url || clerkUiUrl,
  };

  return (
    <>
      <ClerkScript
        scriptUrl={clerkJsScriptUrl(opts)}
        attributes={buildClerkJsScriptAttributes(opts)}
        dataAttribute='data-clerk-js-script'
        router={router}
      />
      <ClerkScript
        scriptUrl={clerkUiScriptUrl(opts)}
        attributes={buildClerkUiScriptAttributes(opts)}
        dataAttribute='data-clerk-ui-script'
        router={router}
      />
    </>
  );
}
