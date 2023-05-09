import type { RequestState } from '@clerk/backend';
import { Clerk } from '@clerk/backend';
import { createProxyUrl, handleValueOrFn, isHttpOrHttps } from '@clerk/shared';

import {
  noSecretKeyOrApiKeyError,
  satelliteAndMissingProxyUrlAndDomain,
  satelliteAndMissingSignInUrl,
} from '../errors';
import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { parseCookies } from './utils';

function isDevelopmentFromApiKey(apiKey: string): boolean {
  return apiKey.startsWith('test_') || apiKey.startsWith('sk_test_');
}

/**
 * @internal
 */
export function authenticateRequest(args: LoaderFunctionArgs, opts: RootAuthLoaderOptions = {}): Promise<RequestState> {
  const { request, context } = args;
  const { loadSession, loadUser, loadOrganization, authorizedParties } = opts;

  // Fetch environment variables across Remix runtimes.
  // 1. First try from process.env if exists (Node).
  // 2. Then try from globalThis (Cloudflare Workers).
  // 3. Then from loader context (Cloudflare Pages).
  // 4. Otherwise check if the user passed the key in the getAuth function or the rootAuthLoader.
  const secretKey = getEnvVariable('CLERK_SECRET_KEY') || (context?.CLERK_SECRET_KEY as string) || opts.secretKey || '';
  const apiKey = getEnvVariable('CLERK_API_KEY') || (context?.CLERK_API_KEY as string) || opts.apiKey || '';
  if (!secretKey && !apiKey) {
    throw new Error(noSecretKeyOrApiKeyError);
  }

  const frontendApi =
    getEnvVariable('CLERK_FRONTEND_API') || (context?.CLERK_FRONTEND_API as string) || opts.frontendApi || '';

  const publishableKey =
    getEnvVariable('CLERK_PUBLISHABLE_KEY') || (context?.CLERK_PUBLISHABLE_KEY as string) || opts.publishableKey || '';

  const jwtKey = getEnvVariable('CLERK_JWT_KEY') || (context?.CLERK_JWT_KEY as string) || opts.jwtKey;

  const apiUrl = getEnvVariable('CLERK_API_URL') || (context?.CLERK_API_URL as string);

  const domain =
    getEnvVariable('CLERK_DOMAIN') ||
    (context?.CLERK_DOMAIN as string) ||
    handleValueOrFn(opts.domain, new URL(request.url)) ||
    '';

  const isSatellite =
    getEnvVariable('CLERK_IS_SATELLITE') === 'true' ||
    (context?.CLERK_IS_SATELLITE as string) === 'true' ||
    handleValueOrFn(opts.isSatellite, new URL(request.url)) ||
    false;

  const requestURL = createProxyUrl({
    request,
  });

  const relativeOrAbsoluteProxyUrl = handleValueOrFn(
    opts?.proxyUrl,
    new URL(requestURL),
    getEnvVariable('CLERK_PROXY_URL') || (context?.CLERK_PROXY_URL as string),
  );

  let proxyUrl;
  if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
    proxyUrl = createProxyUrl({
      request,
      relativePath: relativeOrAbsoluteProxyUrl,
    });
  } else {
    proxyUrl = relativeOrAbsoluteProxyUrl;
  }

  const signInUrl =
    getEnvVariable('CLERK_SIGN_IN_URL') || (context?.CLERK_SIGN_IN_URL as string) || opts.signInUrl || '';

  if (isSatellite && !proxyUrl && !domain) {
    throw new Error(satelliteAndMissingProxyUrlAndDomain);
  }

  if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(secretKey || apiKey)) {
    throw new Error(satelliteAndMissingSignInUrl);
  }

  const { headers } = request;
  const cookies = parseCookies(request);

  const cookieToken = cookies['__session'];
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');

  return Clerk({ apiUrl, apiKey, secretKey, jwtKey, proxyUrl, isSatellite, domain }).authenticateRequest({
    apiKey,
    secretKey,
    jwtKey,
    frontendApi,
    publishableKey,
    loadUser,
    loadSession,
    loadOrganization,
    cookieToken,
    headerToken,
    clientUat: cookies['__client_uat'],
    origin: headers.get('origin') || '',
    host: headers.get('host') as string,
    forwardedPort: headers.get('x-forwarded-port') as string,
    forwardedHost: headers.get('x-forwarded-host') as string,
    referrer: headers.get('referer') || '',
    userAgent: headers.get('user-agent') as string,
    authorizedParties,
    proxyUrl,
    isSatellite,
    domain,
    searchParams: new URL(request.url).searchParams,
    signInUrl,
  });
}
