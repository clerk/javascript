import { useClerk } from '@clerk/clerk-react';
import { buildClerkJsScriptAttributes, clerkJsScriptUrl } from '@clerk/clerk-react/internal';
import NextScript from 'next/script';
import React, { useEffect, useState } from 'react';
import ReactJSXRuntime from 'react/jsx-runtime';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (window as any).__experimental_host_ReactJSXRuntime = ReactJSXRuntime;
    (window as any).__experimental_host_ReactDOMClient = ReactDOMClient;
    (window as any).__experimental_host_ReactDOM = ReactDOM;
    (window as any).__experimental_host_React = React;
    setReady(true);
  }, []);

  /**
   * Notes:
   * `next/script` in 13.x.x when used with App Router will fail to pass any of our `data-*` attributes, resulting in errors
   * Nextjs App Router will automatically move inline scripts inside `<head/>`
   * Using the `nextjs/script` for App Router with the `beforeInteractive` strategy will throw an error because our custom script will be mounted outside the `html` tag.
   */
  const Script = props.router === 'app' ? 'script' : NextScript;

  if (!ready) {
    return null;
  }

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
