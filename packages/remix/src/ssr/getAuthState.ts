import { AuthState, clerk } from '../clerk';
import { RootAuthLoaderOptions } from './types';
import { parseCookies } from './utils';

/**
 * @internal
 */
export async function getAuthState(req: Request, opts: RootAuthLoaderOptions = {}): Promise<AuthState> {
  const { loadSession, loadUser, loadOrganization, jwtKey, authorizedParties } = opts;
  const { headers } = req;
  const cookies = parseCookies(req);

  const cookieToken = cookies['__session'];
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');
  const authState: AuthState = await clerk.authState({
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
    jwtKey,
  });

  return authState;
}
