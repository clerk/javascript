import type { RequestState } from '@clerk/backend';
import { buildRequestUrl, Clerk } from '@clerk/backend';
import { deprecated, handleValueOrFn, isHttpOrHttps, isProxyUrlRelative } from '@clerk/shared';

import {
  noSecretKeyOrApiKeyError,
  satelliteAndMissingProxyUrlAndDomain,
  satelliteAndMissingSignInUrl,
} from '../errors';
import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';

function isDevelopmentFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

/**
 * @internal
 */
export function authenticateRequest(args: LoaderFunctionArgs, opts: RootAuthLoaderOptions = {}): Promise<RequestState> {
  const { request, context } = args;
  const { loadSession, loadUser, loadOrganization } = opts;
  const { audience, authorizedParties } = opts;

  // Fetch environment variables across Remix runtimes.
  // 1. First check if the user passed the key in the getAuth function or the rootAuthLoader.
  // 2. Then try from process.env if exists (Node).
  // 3. Then try from globalThis (Cloudflare Workers).
  // 4. Then from loader context (Cloudflare Pages).
  const secretKey = opts.secretKey || getEnvVariable('CLERK_SECRET_KEY', context) || '';
  const apiKey = opts.apiKey || getEnvVariable('CLERK_API_KEY', context) || '';
  if (apiKey) {
    if (getEnvVariable('CLERK_API_KEY', context)) {
      deprecated('CLERK_API_KEY', 'Use `CLERK_SECRET_KEY` instead.');
    } else {
      deprecated('apiKey', 'Use `secretKey` instead.');
    }
  }

  if (!secretKey && !apiKey) {
    throw new Error(noSecretKeyOrApiKeyError);
  }

  const frontendApi = opts.frontendApi || getEnvVariable('CLERK_FRONTEND_API', context) || '';
  if (frontendApi) {
    if (getEnvVariable('CLERK_FRONTEND_API', context)) {
      deprecated('CLERK_FRONTEND_API', 'Use `CLERK_PUBLISHABLE_KEY` instead.');
    } else {
      deprecated('frontendApi', 'Use `publishableKey` instead.');
    }
  }

  const publishableKey = opts.publishableKey || getEnvVariable('CLERK_PUBLISHABLE_KEY', context) || '';

  const jwtKey = opts.jwtKey || getEnvVariable('CLERK_JWT_KEY', context);

  const apiUrl = getEnvVariable('CLERK_API_URL', context);

  const domain = handleValueOrFn(opts.domain, new URL(request.url)) || getEnvVariable('CLERK_DOMAIN', context) || '';

  const isSatellite =
    handleValueOrFn(opts.isSatellite, new URL(request.url)) ||
    getEnvVariable('CLERK_IS_SATELLITE', context) === 'true' ||
    false;

  const requestURL = buildRequestUrl(request);

  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    opts?.proxyUrl,
    requestURL,
    getEnvVariable('CLERK_PROXY_URL', context),
  );

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && isProxyUrlRelative(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = new URL(relativeOrAbsoluteProxyUrl, requestURL).toString();
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const signInUrl = opts.signInUrl || getEnvVariable('CLERK_SIGN_IN_URL', context) || '';

  const signUpUrl = opts.signUpUrl || getEnvVariable('CLERK_SIGN_UP_URL', context) || '';

  const afterSignInUrl = opts.afterSignInUrl || getEnvVariable('CLERK_AFTER_SIGN_IN_URL', context) || '';

  const afterSignUpUrl = opts.afterSignUpUrl || getEnvVariable('CLERK_AFTER_SIGN_UP_URL', context) || '';

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(secretKey || apiKey)) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  return Clerk({
    apiUrl,
    apiKey,
    secretKey,
    jwtKey,
    proxyUrl,
    isSatellite,
    domain,
    userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
  }).authenticateRequest({
    apiKey,
    audience,
    secretKey,
    jwtKey,
    frontendApi,
    publishableKey,
    loadUser,
    loadSession,
    loadOrganization,
    authorizedParties,
    proxyUrl,
    isSatellite,
    domain,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    request,
  });
}
