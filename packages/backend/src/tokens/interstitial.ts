import type { MultiDomainAndOrProxyPrimitives } from '@clerk/types';

import { API_VERSION } from '../constants';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { callWithRetry } from '../util/callWithRetry';
import { isStaging } from '../util/instance';
import { isDevOrStagingUrl } from '../util/isDevOrStagingUrl';
import { parsePublishableKey } from '../util/parsePublishableKey';
import { joinPaths } from '../util/path';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';
import type { DebugRequestSate } from './request';

export type LoadInterstitialOptions = {
  apiUrl: string;
  frontendApi: string;
  publishableKey: string;
  pkgVersion?: string;
  debugData?: DebugRequestSate;
  isSatellite?: boolean;
  signInUrl?: string;
} & MultiDomainAndOrProxyPrimitives;

// TODO: use the same function from @clerk/shared once treeshakable
export function addClerkPrefix(str: string | undefined) {
  if (!str) {
    return '';
  }
  let regex;
  if (str.match(/^(clerk\.)+\w*$/)) {
    regex = /(clerk\.)*(?=clerk\.)/;
  } else if (str.match(/\.clerk.accounts/)) {
    return str;
  } else {
    regex = /^(clerk\.)*/gi;
  }

  const stripped = str.replace(regex, '');
  return `clerk.${stripped}`;
}

export function loadInterstitialFromLocal(options: Omit<LoadInterstitialOptions, 'apiUrl'>) {
  options.frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi || '';
  const domainOnlyInProd = !isDevOrStagingUrl(options.frontendApi) ? addClerkPrefix(options.domain) : '';
  const {
    debugData,
    frontendApi,
    pkgVersion,
    publishableKey,
    proxyUrl,
    isSatellite = false,
    domain,
    signInUrl,
  } = options;
  return `
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
        <script>
            window.__clerk_frontend_api = '${frontendApi}';
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
                ${
                  publishableKey
                    ? `script.setAttribute('data-clerk-publishable-key', '${publishableKey}');`
                    : `script.setAttribute('data-clerk-frontend-api', '${frontendApi}');`
                }

                ${domain ? `script.setAttribute('data-clerk-domain', '${domain}');` : ''}
                ${proxyUrl ? `script.setAttribute('data-clerk-proxy-url', '${proxyUrl}')` : ''};
                script.async = true;
                script.src = '${getScriptUrl(proxyUrl || domainOnlyInProd || frontendApi, pkgVersion)}';
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
  options.frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi || '';
  const url = buildPublicInterstitialUrl(options);
  const response = await callWithRetry(() => runtime.fetch(buildPublicInterstitialUrl(options)));

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
  options.frontendApi = parsePublishableKey(options.publishableKey)?.frontendApi || options.frontendApi || '';
  const { apiUrl, frontendApi, pkgVersion, publishableKey, proxyUrl, isSatellite, domain } = options;
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, API_VERSION, '/public/interstitial');
  url.searchParams.append('clerk_js_version', getClerkJsMajorVersionOrTag(frontendApi, pkgVersion));
  if (publishableKey) {
    url.searchParams.append('publishable_key', publishableKey);
  } else {
    url.searchParams.append('frontend_api', frontendApi);
  }
  if (proxyUrl) {
    url.searchParams.append('proxy_url', proxyUrl);
  }

  if (isSatellite) {
    url.searchParams.append('is_satellite', 'true');
  }

  if (domain) {
    url.searchParams.append('domain', domain);
  }

  return url.href;
}

// TODO: Move to @clerk/shared as the same logic is used in @clerk/react
const getClerkJsMajorVersionOrTag = (frontendApi: string, pkgVersion?: string) => {
  if (!pkgVersion && isStaging(frontendApi)) {
    return 'staging';
  }

  if (!pkgVersion) {
    return 'latest';
  }

  if (pkgVersion.includes('next')) {
    return 'next';
  }

  return pkgVersion.split('.')[0] || 'latest';
};

const getScriptUrl = (frontendApi: string, pkgVersion?: string) => {
  const noSchemeFrontendApi = frontendApi.replace(/http(s)?:\/\//, '');
  const major = getClerkJsMajorVersionOrTag(frontendApi, pkgVersion);
  return `https://${noSchemeFrontendApi}/npm/@clerk/clerk-js@${major}/dist/clerk.browser.js`;
};
