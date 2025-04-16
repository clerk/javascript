import { useClerk } from '@clerk/clerk-react';
import { clerkJsScriptUrl } from '@clerk/clerk-react/internal';
import NextScript from 'next/script';
import React from 'react';

import { useClerkNextOptions } from '../client-boundary/NextOptionsContext';

type ClerkJSScriptProps = {
  router: 'app' | 'pages';
};

function ClerkJSScript(props: ClerkJSScriptProps) {
  const { publishableKey, clerkJSUrl, clerkJSVersion, clerkJSVariant, nonce } = useClerkNextOptions();
  const { domain, proxyUrl } = useClerk();

  /**
   * If no publishable key, avoid appending an invalid script in the DOM.
   */
  if (!publishableKey) {
    return null;
  }

  const options = {
    domain,
    proxyUrl,
    publishableKey,
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
      // `nextjs/script` will add defer by default and does not get removed when we async is true
      defer={props.router === 'pages' ? false : undefined}
      strategy={props.router === 'pages' ? 'beforeInteractive' : undefined}
      async
    >
      {`
          (async function() {
            const s = document.createElement('script');
            window.__clerk_script_promise = new Promise(function (res,rej){
              s.addEventListener('load', function() {res(s);});
              s.addEventListener('error', function() {rej();});
            })

            s.setAttribute('crossorigin', "anonymous");
            s.setAttribute('data-clerk-js-script', "true");
            s.setAttribute('data-clerk-publishable-key', "${publishableKey}")
            s.setAttribute('data-clerk-domain', "${domain}")
            s.setAttribute('data-clerk-proxy-url', "${proxyUrl}")
            s.setAttribute('nonce', "${nonce}")
            s.async = true;
            s.defer = false;

            s.src = "${scriptUrl}";
            document.head.appendChild(s);
            try {
              await window.__clerk_script_promise;
            } catch {}
          })();
        `}
    </Script>
  );
}

export { ClerkJSScript };
