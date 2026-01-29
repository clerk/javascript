import { useClerk } from '@clerk/react';
import {
  buildClerkJsScriptAttributes,
  buildClerkUiScriptAttributes,
  clerkJsScriptUrl,
  clerkUiScriptUrl,
  IS_REACT_SHARED_VARIANT_COMPATIBLE,
} from '@clerk/react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

const DEFAULT_CLERK_UI_VARIANT = IS_REACT_SHARED_VARIANT_COMPATIBLE ? ('shared' as const) : ('' as const);

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
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce, clerkUiUrl, clerkUIVariant, ui } =
    useClerkNextOptions();
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
    clerkUIVariant: clerkUIVariant ?? DEFAULT_CLERK_UI_VARIANT,
  };

  const uiScriptUrl = clerkUiScriptUrl(opts);
  const isSharedVariant = opts.clerkUIVariant === 'shared';

  return (
    <>
      <ClerkScript
        scriptUrl={clerkJsScriptUrl(opts)}
        attributes={buildClerkJsScriptAttributes(opts)}
        dataAttribute='data-clerk-js-script'
        router={router}
      />
      {isSharedVariant ? (
        <link
          rel='preload'
          href={uiScriptUrl}
          as='script'
          crossOrigin='anonymous'
          nonce={nonce}
        />
      ) : (
        <ClerkScript
          scriptUrl={uiScriptUrl}
          attributes={buildClerkUiScriptAttributes(opts)}
          dataAttribute='data-clerk-ui-script'
          router={router}
        />
      )}
    </>
  );
}
