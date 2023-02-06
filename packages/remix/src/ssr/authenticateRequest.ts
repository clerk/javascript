import type { RequestState } from '@clerk/backend';
import { Clerk } from '@clerk/backend';

import { noSecretKeyOrApiKeyError } from '../errors';
import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions, RootAuthLoaderOptionsWithExperimental } from './types';
import { handleIsSatelliteBooleanOrFn, parseCookies } from './utils';

/**
 * @internal
 */
export function authenticateRequest(args: LoaderFunctionArgs, opts: RootAuthLoaderOptions = {}): Promise<RequestState> {
  const { request, context } = args;
  const { loadSession, loadUser, loadOrganization, authorizedParties } = opts as RootAuthLoaderOptionsWithExperimental;

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
    (opts as RootAuthLoaderOptionsWithExperimental).domain ||
    '';

  const isSatellite =
    getEnvVariable('CLERK_IS_SATELLITE') === 'true' ||
    (context?.CLERK_IS_SATELLITE as string) === 'true' ||
    handleIsSatelliteBooleanOrFn((opts as RootAuthLoaderOptionsWithExperimental).isSatellite, new URL(request.url)) ||
    false;

  const proxyUrl =
    getEnvVariable('CLERK_PROXY_URL') ||
    (context?.CLERK_PROXY_URL as string) ||
    (opts as RootAuthLoaderOptionsWithExperimental).proxyUrl ||
    '';

  const { headers } = request;
  const cookies = parseCookies(request);

  const cookieToken = cookies['__session'];
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');

  // @ts-expect-error
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
    // @ts-expect-error
    isSatellite,
    domain,
  });
}
