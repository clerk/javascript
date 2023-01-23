import { API_VERSION } from '../constants';
// DO NOT CHANGE: Runtime needs to be imported as a default export so that we can stub its dependencies with Sinon.js
// For more information refer to https://sinonjs.org/how-to/stub-dependency/
import runtime from '../runtime';
import { callWithRetry } from '../util/callWithRetry';
import { isStaging } from '../util/instance';
import { parsePublishableKey } from '../util/parsePublishableKey';
import { joinPaths } from '../util/path';
import { TokenVerificationError, TokenVerificationErrorAction, TokenVerificationErrorReason } from './errors';

export type LoadInterstitialOptions = {
  apiUrl: string;
  frontendApi: string;
  proxyUrl?: string;
  publishableKey: string;
  pkgVersion?: string;
  debugData?: any;
};

export function loadInterstitialFromLocal(options: Omit<LoadInterstitialOptions, 'apiUrl'>) {
  const { debugData, frontendApi, pkgVersion, publishableKey, proxyUrl } = options;
  return `
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
        <script>
            window.__clerk_frontend_api = '${frontendApi}';
            window.__clerk_debug = ${JSON.stringify(debugData || {})};
            window.__clerk_proxy_url = '${proxyUrl}';
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
                    await Clerk.load();
                    if(window.location.href.indexOf("#") === -1){
                      window.location.href = window.location.href;
                    } else if (window.navigator.userAgent.toLowerCase().includes("firefox/")){
                        formRedirect();
                    } else {
                        window.location.reload();
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
                script.async = true;
                script.src = '${getScriptUrl(frontendApi, pkgVersion)}';
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
  const { apiUrl, frontendApi, pkgVersion, publishableKey } = options;
  const url = new URL(apiUrl);
  url.pathname = joinPaths(url.pathname, API_VERSION, '/public/interstitial');
  url.searchParams.append('clerk_js_version', getClerkJsMajorVersionOrTag(frontendApi, pkgVersion));
  if (publishableKey) {
    url.searchParams.append('publishable_key', publishableKey);
  } else {
    url.searchParams.append('frontend_api', frontendApi);
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
  const major = getClerkJsMajorVersionOrTag(frontendApi, pkgVersion);
  return `https://${frontendApi}/npm/@clerk/clerk-js@${major}/dist/clerk.browser.js`;
};
