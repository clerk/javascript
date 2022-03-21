import { LIB_VERSION } from '../info';
import { BrowserClerk } from '../types';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

const FAILED_TO_LOAD_ERROR = 'Clerk: Failed to load Clerk';
const MISSING_PROVIDER_ERROR = 'Clerk: Missing provider';
const MISSING_BODY_ERROR = 'Clerk: Missing <body> element.';

function isStaging(frontendApi: string): boolean {
  return (
    frontendApi.endsWith('.lclstage.dev') ||
    frontendApi.endsWith('.stgstage.dev') ||
    frontendApi.endsWith('.clerkstage.dev')
  );
}

function extractTag(packageJsonVersion: string) {
  return packageJsonVersion.match(/-(.*)\./);
}

function getScriptSrc({ frontendApi, scriptUrl, scriptVariant = '' }: LoadScriptParams): string {
  if (scriptUrl) {
    return scriptUrl;
  }

  const majorVersion = isStaging(frontendApi) ? 'staging' : parseInt(LIB_VERSION.split('.')[0], 10);

  const tag = extractTag(LIB_VERSION);
  const sourceVersion = tag === null ? majorVersion : 'next';

  if (scriptVariant) {
    scriptVariant = scriptVariant.replace(/\.+$/, '') as ScriptVariant;
    scriptVariant += '.';
  }

  return `https://${frontendApi}/npm/@clerk/clerk-js@${sourceVersion}/dist/clerk.${scriptVariant}browser.js`;
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
