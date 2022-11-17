import { AuthState, clerk } from '../clerk';
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
  const authState: AuthState = await clerk.authState({
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
