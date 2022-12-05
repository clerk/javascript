import { AuthState, default as Clerk } from '@clerk/backend';

import { noApiKeyError, noFrontendApiError } from '../errors';
import { assertEnvVar, getEnvVariable } from '../utils';
import { LoaderFunctionArgs, RootAuthLoaderOptions } from './types';
import { parseCookies } from './utils';

/**
 * @internal
 */
export async function getAuthState(args: LoaderFunctionArgs, opts: RootAuthLoaderOptions = {}): Promise<AuthState> {
  const { request, context } = args;
  const { loadSession, loadUser, loadOrganization, authorizedParties } = opts;

  // Fetch environment variables across Remix runtimes.
  // 1. First try from process.env if exists (Node).
  // 2. Then try from globalThis (Cloudflare Workers).
  // 3. Then from loader context (Cloudflare Pages).
  // 4. Otherwise check if the user passed the key in the getAuth function or the rootAuthLoader.
  const apiKey = getEnvVariable('CLERK_API_KEY') || (context?.CLERK_API_KEY as string) || opts.apiKey;
  assertEnvVar(apiKey, noApiKeyError);

  const frontendApi =
    getEnvVariable('CLERK_FRONTEND_API') || (context?.CLERK_FRONTEND_API as string) || opts.frontendApi;
  assertEnvVar(frontendApi, noFrontendApiError);

  const jwtKey = getEnvVariable('CLERK_JWT_KEY') || (context?.CLERK_JWT_KEY as string) || opts.jwtKey;

  const { headers } = request;
  const cookies = parseCookies(request);

  const cookieToken = cookies['__session'];
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');
  const authState: AuthState = await Clerk({ apiKey, jwtKey }).authState({
    apiKey,
    jwtKey,
    frontendApi,
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
  });

  return authState;
}
