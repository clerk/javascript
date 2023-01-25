import { parsePublishableKey } from '@clerk/shared';
import type { Clerk as ClerkInterface } from '@clerk/types';

import { LIB_VERSION } from '../info';
import type { BrowserClerk } from '../types';
import { errorThrower } from './errorThrower';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';
const MISSING_BODY_ERROR = 'Clerk: Missing <body> element.';

const UNSTABLE_RELEASE_TAGS = ['staging', 'next'];

const extractNonStableTag = (packageVersion: string) => {
  const tag = packageVersion.match(/-(.*)\./)?.[1];
  return tag && UNSTABLE_RELEASE_TAGS.includes(tag) ? tag : undefined;
};

const extractMajorVersion = (packageVersion: string) => {
  return packageVersion.split('.')[0];
};

const forceStagingReleaseForClerkFapi = (frontendApi: string): boolean => {
  return (
    frontendApi.endsWith('.lclstage.dev') ||
    frontendApi.endsWith('.stgstage.dev') ||
    frontendApi.endsWith('.clerkstage.dev') ||
    frontendApi.endsWith('.accountsstage.dev')
  );
};

function getScriptSrc({ publishableKey, frontendApi, scriptUrl, scriptVariant = '' }: LoadScriptParams): string {
  if (scriptUrl) {
    return scriptUrl;
  }

  const scriptHost = publishableKey ? parsePublishableKey(publishableKey)?.frontendApi : frontendApi;
  if (!scriptHost) {
    errorThrower.throwMissingPublishableKeyError();
  }

  const variant = scriptVariant ? `${scriptVariant.replace(/\.+$/, '')}.` : '';
  const getUrlForTag = (target: string) => {
    return `https://${scriptHost}/npm/@clerk/clerk-js@${target}/dist/clerk.${variant}browser.js`;
  };
  const nonStableTag = extractNonStableTag(LIB_VERSION);

  if (forceStagingReleaseForClerkFapi(scriptHost!)) {
    return nonStableTag ? getUrlForTag(nonStableTag) : getUrlForTag('staging');
  }

  if (nonStableTag) {
    return getUrlForTag(nonStableTag);
  }

  return getUrlForTag(extractMajorVersion(LIB_VERSION));
}

export type ScriptVariant = '' | 'headless';

export interface LoadScriptParams {
  /**
   * @deprecated Use `publishableKey` instead.
   */
  frontendApi?: string;
  publishableKey?: string;
  proxyUrl?: string;

  domain?: string;
  isSatellite?: boolean;
  scriptUrl?: string;

  scriptVariant?: ScriptVariant;
}

export async function loadScript(params: LoadScriptParams): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    const { frontendApi, publishableKey, proxyUrl, domain, isSatellite } = params;

    if (global.Clerk) {
      resolve(null);
    }

    const script = document.createElement('script');

    if (!publishableKey && !frontendApi) {
      errorThrower.throwMissingPublishableKeyError();
    }

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

    if (isSatellite) {
      script.setAttribute('data-clerk-is-satellite', isSatellite ? 'true' : 'false');
    }

    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    if (!document.body) {
      reject(MISSING_BODY_ERROR);
    }

    script.addEventListener('load', () => resolve(script));
    script.addEventListener('error', () => reject(FAILED_TO_LOAD_ERROR));

    script.src = getScriptSrc(params);
    document.body.appendChild(script);
  });
}
