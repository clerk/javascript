import { LIB_VERSION } from '../info';
import { BrowserClerk } from '../types';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';
const MISSING_PROVIDER_ERROR = 'Clerk: Missing provider';
const MISSING_BODY_ERROR = 'Clerk: Missing <body> element.';

const UNSTABLE_RELEASE_TAGS = ['staging'];

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

function getScriptSrc({ frontendApi, scriptUrl, scriptVariant = '' }: LoadScriptParams): string {
  if (scriptUrl) {
    return scriptUrl;
  }

  const variant = scriptVariant ? `${scriptVariant.replace(/\.+$/, '')}.` : '';
  const getUrlForTag = (target: string) => {
    return `https://${frontendApi}/npm/@clerk/clerk-js@${target}/dist/clerk.${variant}browser.js`;
  };

  if (forceStagingReleaseForClerkFapi(frontendApi)) {
    return getUrlForTag('staging');
  }

  const nonStableTag = extractNonStableTag(LIB_VERSION);
  if (nonStableTag) {
    return getUrlForTag(nonStableTag);
  }

  return getUrlForTag(extractMajorVersion(LIB_VERSION));
}

export type ScriptVariant = '' | 'headless';

export interface LoadScriptParams {
  frontendApi: string;
  scriptUrl?: string;
  scriptVariant?: ScriptVariant;
}

export function loadScript(params: LoadScriptParams): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    const { frontendApi } = params;

    if (global.Clerk) {
      resolve(null);
    }

    if (!frontendApi) {
      reject(MISSING_PROVIDER_ERROR);
    }

    const script = document.createElement('script');
    const src = getScriptSrc(params);

    script.setAttribute('data-clerk-frontend-api', frontendApi);
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
