import { LIB_VERSION } from '../info';
import { BrowserClerk } from '../types';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';
const MISSING_PROVIDER_ERROR = 'Clerk: Missing provider';
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
    frontendApi.endsWith('.clerkstage.dev')
  );
};

// TODO: Undup
function parsePublishableKey(key: string, pkg: string) {
  try {
    if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) {
      throw 'error';
    }
    const keyParts = key.split('_');
    const instanceType = keyParts[1] as 'test' | 'live';
    let frontendApi = atob(keyParts[2]);
    if (!frontendApi.endsWith('$')) {
      throw 'error';
    }
    frontendApi = frontendApi.slice(0, -1);
    return { instanceType, frontendApi };
  } catch (e) {
    throw new Error(
      `Clerk Error: The publishableKey passed to Clerk is malformed. Your publishable key can be retrieved from https://dashboard.clerk.dev/last-active?path=api-keys (package=${pkg};passed=${key})`,
    );
  }
}

function getScriptSrc({ publishableKey, frontendApi, scriptUrl, scriptVariant = '' }: LoadScriptParams): string {
  if (scriptUrl) {
    return scriptUrl;
  }

  let scriptHost: string;
  if (publishableKey) {
    const { frontendApi: derivedFrontendApi } = parsePublishableKey(publishableKey, '@clerk/clerk-react');
    scriptHost = derivedFrontendApi;
  } else if (frontendApi) {
    scriptHost = frontendApi;
  } else {
    throw new Error(
      'Internal Clerk Error: Neither frontendApi nor publishableKey passed to getScriptSrc. Please report to support@clerk.dev if you are seeing this while developing an application with Clerk. (package=@clerk/clerk-react)',
    );
  }

  const variant = scriptVariant ? `${scriptVariant.replace(/\.+$/, '')}.` : '';
  const getUrlForTag = (target: string) => {
    return `https://${scriptHost}/npm/@clerk/clerk-js@${target}/dist/clerk.${variant}browser.js`;
  };
  const nonStableTag = extractNonStableTag(LIB_VERSION);

  if (forceStagingReleaseForClerkFapi(scriptHost)) {
    return nonStableTag ? getUrlForTag(nonStableTag) : getUrlForTag('staging');
  }

  if (nonStableTag) {
    return getUrlForTag(nonStableTag);
  }

  return getUrlForTag(extractMajorVersion(LIB_VERSION));
}

export type ScriptVariant = '' | 'headless';

export interface LoadScriptParams {
  frontendApi?: string;
  publishableKey?: string;
  scriptUrl?: string;
  scriptVariant?: ScriptVariant;
}

export function loadScript(params: LoadScriptParams): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    const { frontendApi, publishableKey } = params;

    if (global.Clerk) {
      resolve(null);
    }

    const script = document.createElement('script');
    const src = getScriptSrc(params);

    if (publishableKey) {
      script.setAttribute('data-clerk-publishable-key', publishableKey);
    } else if (frontendApi) {
      script.setAttribute('data-clerk-frontend-api', frontendApi);
    } else {
      // TODO: Rewrite error
      reject(MISSING_PROVIDER_ERROR);
    }

    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    if (!document.body) {
      reject(MISSING_BODY_ERROR);
    }

    script.addEventListener('load', () => resolve(script));
    script.addEventListener('error', () => reject(FAILED_TO_LOAD_ERROR));

    script.src = src;
    document.body.appendChild(script);
  });
}
