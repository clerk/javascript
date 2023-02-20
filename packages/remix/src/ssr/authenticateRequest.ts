import type { RequestState } from '@clerk/backend';
import { Clerk, convertToSHA1 } from '@clerk/backend';
import { isHttpOrHttps, requestProxyUrlToAbsoluteURL } from '@clerk/shared';

import { noRelativeProxyInSSR, noSecretKeyOrApiKeyError } from '../errors';
import { getEnvVariable } from '../utils';
import type { LoaderFunctionArgs, RootAuthLoaderOptions, RootAuthLoaderOptionsWithExperimental } from './types';
import { handleIsSatelliteBooleanOrFn, parseCookies } from './utils';

// move to utils
export const getCookieForInstance = (cookies: any, name: string) => {
  if (cookies[name]) {
    return cookies[name];
  }

  return cookies['__client_uat'];
};

export type buildCookieNameOptions = Pick<
  RootAuthLoaderOptionsWithExperimental,
  'publishableKey' | 'domain' | 'proxyUrl' | 'isSatellite'
>;
export const buildCookieName = async ({ options, request }: { options: buildCookieNameOptions; request: Request }) => {
  const { publishableKey, domain, proxyUrl, isSatellite } = options;
  const keyArray = [] as string[];

  if (publishableKey) {
    keyArray.push(publishableKey);
  }

  if (isSatellite && domain) {
    keyArray.push(domain);
  }

  if (proxyUrl) {
    keyArray.push(requestProxyUrlToAbsoluteURL(proxyUrl, new URL(request.url).origin));
  }

  const stringValue = keyArray.join('-');
  console.log(stringValue, 'stringValue');

  const toUint8 = new TextEncoder().encode(stringValue);

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const result = await convertToSHA1(toUint8);
  return `__client_uat_${result.slice(0, 12)}`;
};

/**
 * @internal
 */
export async function authenticateRequest(
  args: LoaderFunctionArgs,
  opts: RootAuthLoaderOptions = {},
): Promise<RequestState> {
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

  if (!!proxyUrl && !isHttpOrHttps(proxyUrl)) {
    throw new Error(noRelativeProxyInSSR);
  }

  const { headers } = request;
  const cookies = parseCookies(request);

  const cookieToken = cookies['__session'];
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');

  const clientUatName = await buildCookieName({ options: { publishableKey, domain, proxyUrl, isSatellite }, request });
  console.log(clientUatName, 'clientUatName');

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

    isSynced: new URL(request.url).searchParams.get('__clerk_synced') === 'true',
  });
}
