import { addClerkPrefix, isValidProxyUrl, loadScript, parsePublishableKey, proxyUrlToAbsoluteURL } from '@clerk/shared';

import type { IsomorphicClerkOptions } from '../types';
import { errorThrower } from './errorThrower';
import { isDevOrStagingUrl } from './isDevOrStageUrl';

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';

type LoadClerkJsScriptOptions = Omit<IsomorphicClerkOptions, 'proxyUrl' | 'domain'> & {
  proxyUrl: string;
  domain: string;
};

export const loadClerkJsScript = async (opts: LoadClerkJsScriptOptions) => {
  const { frontendApi, publishableKey } = opts;

  if (!publishableKey && !frontendApi) {
    errorThrower.throwMissingPublishableKeyError();
  }

  return loadScript(clerkJsScriptUrl(opts), {
    async: true,
    crossOrigin: 'anonymous',
    beforeLoad: applyClerkJsScriptAttributes(opts),
  }).catch(() => {
    throw new Error(FAILED_TO_LOAD_ERROR);
  });
};

const clerkJsScriptUrl = (opts: LoadClerkJsScriptOptions) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey, frontendApi } = opts;

  if (clerkJSUrl) {
    return clerkJSUrl;
  }

  let scriptHost = '';
  if (!!proxyUrl && isValidProxyUrl(proxyUrl)) {
    scriptHost = proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, '');
  } else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || frontendApi || '')) {
    scriptHost = addClerkPrefix(domain);
  } else {
    scriptHost = parsePublishableKey(publishableKey)?.frontendApi || frontendApi || '';
  }

  const variant = clerkJSVariant ? `${clerkJSVariant.replace(/\.+$/, '')}.` : '';
  const version = clerkJSVersion || getPrereleaseTag(PACKAGE_VERSION) || getMajorVersion(PACKAGE_VERSION);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
};

const applyClerkJsScriptAttributes = (options: LoadClerkJsScriptOptions) => (script: HTMLScriptElement) => {
  const { publishableKey, frontendApi, proxyUrl, domain } = options;
  if (publishableKey) {
    script.setAttribute('data-clerk-publishable-key', publishableKey);
  } else if (frontendApi) {
    script.setAttribute('data-clerk-frontend-api', frontendApi);
  }

  if (proxyUrl) {
    script.setAttribute('data-clerk-proxy-url', proxyUrl);
  }

  if (domain) {
    script.setAttribute('data-clerk-domain', domain);
  }
};

const getPrereleaseTag = (packageVersion: string) => packageVersion.match(/-(.*)\./)?.[1];

const getMajorVersion = (packageVersion: string) => packageVersion.split('.')[0];
