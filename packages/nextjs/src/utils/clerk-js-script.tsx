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
  console.log(scriptUrl);

  /**
   * Notes:
   * `next/script` in 13.x.x when used with App Router will fail to pass any of our `data-*` attributes, resulting in errors
   * Nextjs App Router will automatically move inline scripts inside `<head/>`
   * Using the `nextjs/script` for App Router with the `beforeInteractive` strategy will throw an error because our custom script will be mounted outside the `html` tag.
   */
  const Script = props.router === 'app' ? 'script' : NextScript;
  console.log(Script);

  return (
    <>
      <script>
        {`
        function() {
          const s = document.createElement('script');
          window.__clerk_script_promise = new Promise((res,rej)=> {
          })
          script.setAttribute('crossorigin', 'anonymous');
          script.setAttribute('data-clerk-js-script', 'true');
          script.async = true;
          script.defer = false;

          script.addEventListener('load', () => {
            //script.remove();
            //resolve(script);
            console.log("oantelos")
          });

          script.addEventListener('error', () => {
            //script.remove();
            //reject();
            console.log("nahahahaa")
          });

          script.src = "${scriptUrl}";
          //script.nonce = nonce;
          //beforeLoad?.(script);
          script.setAttribute('data-clerk-publishable-key', "${publishableKey}")
          document.head.appendChild(script);
        }



      `}
      </script>

      {/* <Script
        src={scriptUrl}
        data-clerk-js-script
        async
        // `nextjs/script` will add defer by default and does not get removed when we async is true
        defer={props.router === 'pages' ? false : undefined}
        crossOrigin='anonymous'
        strategy={props.router === 'pages' ? 'beforeInteractive' : undefined}
        onLoad={()=>{
          console.log("Congrats")
        }}
        onError={()=>{
          console.log("why this ?")
        }}
        {...buildClerkJsScriptAttributes(options)}
      /> */}
    </>
  );
}

export { ClerkJSScript };
