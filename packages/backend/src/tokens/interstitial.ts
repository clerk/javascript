import type { MultiDomainAndOrProxyPrimitives } from '@clerk/types';

import { API_VERSION, USER_AGENT } from '../constants';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { joinPaths } from '../util/path';
import {
  addClerkPrefix,
  callWithRetry,
  deprecated,
  getClerkJsMajorVersionOrTag,
  getScriptUrl,
  isDevOrStagingUrl,
  parsePublishableKey,
} from '../util/shared';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import type { DebugRequestSate } from './request';

export type LoadInterstitialOptions = {
  apiUrl: string;
  publishableKey: string;
  clerkJSUrl?: string;
  clerkJSVersion?: string;
  userAgent?: string;
  /**
   * @deprecated
   */
  pkgVersion?: string;
  debugData?: DebugRequestSate;
  isSatellite?: boolean;
  signInUrl?: string;
} & MultiDomainAndOrProxyPrimitives;

export function loadInterstitialFromLocal(options: Omit<LoadInterstitialOptions, 'apiUrl'>) {
  if (options.pkgVersion) {
    deprecated('pkgVersion', 'Use `clerkJSVersion` instead.');
  }

  const frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || '';
  const domainOnlyInProd = !isDevOrStagingUrl(frontendApi) ? addClerkPrefix(options.domain) : '';
  const {
    debugData,
    pkgVersion,
    clerkJSUrl,
    clerkJSVersion,
    publishableKey,
    proxyUrl,
    isSatellite = false,
    domain,
    signInUrl,
  } = options;
  return `
    <head>
        <meta charset="UTF-8" />
        <style>
          @media (prefers-color-scheme: dark) {
            body {
              background-color: black;
            }
          }
        </style>
    </head>
    <body>
        <script>
            window.__clerk_debug = ${JSON.stringify(debugData || {})};
            ${proxyUrl ? `window.__clerk_proxy_url = '${proxyUrl}'` : ''}
            ${domain ? `window.__clerk_domain = '${domain}'` : ''}
            window.startClerk = async () => {
                function formRedirect(){
                    const form = '<form method="get" action="" name="redirect"></form>';
                    document.body.innerHTML = document.body.innerHTML + form;

                    const searchParams = new URLSearchParams(window.location.search);
                    for (let paramTuple of searchParams) {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = paramTuple[0];
                        input.value = paramTuple[1];
                        document.forms.redirect.appendChild(input);
                    }
                    const url = new URL(window.location.origin + window.location.pathname + window.location.hash);
                    window.history.pushState({}, '', url);

                    document.forms.redirect.action = window.location.pathname + window.location.hash;
                    document.forms.redirect.submit();
                }

                const Clerk = window.Clerk;
                try {
                    await Clerk.load({
                        isSatellite: ${isSatellite},
                        isInterstitial: ${true},
                        signInUrl: ${signInUrl ? `'${signInUrl}'` : undefined}
                    });
                    if(Clerk.loaded){
                      if(window.location.href.indexOf("#") === -1){
                        window.location.href = window.location.href;
                      } else if (window.navigator.userAgent.toLowerCase().includes("firefox/")){
                          formRedirect();
                      } else {
                          window.location.reload();
                      }
                    }
                } catch (err) {
                    console.error('Clerk: ', err);
                }
            };
            (() => {
                const script = document.createElement('script');
                script.setAttribute('data-clerk-publishable-key', '${publishableKey}');

                ${domain ? `script.setAttribute('data-clerk-domain', '${domain}');` : ''}
                ${proxyUrl ? `script.setAttribute('data-clerk-proxy-url', '${proxyUrl}')` : ''};
                script.async = true;
                script.src = '${
                  clerkJSUrl ||
                  getScriptUrl(proxyUrl || domainOnlyInProd || frontendApi, {
                    pkgVersion,
                    clerkJSVersion,
                  })
                }';
                script.crossOrigin = 'anonymous';
                script.addEventListener('load', startClerk);
                document.body.appendChild(script);
            })();
        </script>
    </body>
`;
}

// TODO: Add caching to Interstitial
export async function loadInterstitialFromBAPI(options: LoadInterstitialOptions) {
  if (options.pkgVersion) {
    deprecated('pkgVersion', 'Use `clerkJSVersion` instead.');
  }

  const url = buildPublicInterstitialUrl(options);
  const response = await callWithRetry(() =>
    runtime.fetch(buildPublicInterstitialUrl(options), {
      method: 'GET',
      headers: {
        'Clerk-Backend-SDK': options.userAgent || USER_AGENT,
      },
    }),
  );

  if (!response.ok) {
    throw new TokenVerificationError({
      action: TokenVerificationErrorAction.ContactSupport,
      message: `Error loading Clerk Interstitial from ${url} with code=${response.status}`,
      reason: TokenVerificationErrorReason.RemoteInterstitialFailedToLoad,
    });
  }

  return response.text();
}

export function buildPublicInterstitialUrl(options: LoadInterstitialOptions) {
  const frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || '';
  const { apiUrl, pkgVersion, clerkJSVersion, publishableKey, proxyUrl, isSatellite, domain, signInUrl } = options;
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, API_VERSION, '/public/interstitial');

  url.searchParams.append('clerk_js_version', clerkJSVersion || getClerkJsMajorVersionOrTag(frontendApi, pkgVersion));
  if (publishableKey) {
    url.searchParams.append('publishable_key', publishableKey);
  }

  if (proxyUrl) {
    url.searchParams.append('proxy_url', proxyUrl);
  }

  if (isSatellite) {
    url.searchParams.append('is_satellite', 'true');
  }

  url.searchParams.append('sign_in_url', signInUrl || '');

  if (!isDevOrStagingUrl(frontendApi)) {
    url.searchParams.append('use_domain_for_script', 'true');
  }

  if (domain) {
    url.searchParams.append('domain', domain);
  }

  return url.href;
}
