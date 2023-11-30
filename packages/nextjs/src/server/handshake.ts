import { verifyToken } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import { joinPaths } from '@clerk/shared/url';
import { serialize as serializeCookie } from 'cookie';

import type { ClerkRequest } from './clerk-request';
import { createClerkRequest } from './clerk-request';
import { API_URL, API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import type { WithAuthOptions } from './types';

export const AuthenticateRequestStatus = {
  SignedOut: 'signed-out',
  SignedIn: 'signed-in',
  Handshake: 'handshake',
} as const;

export type AuthenticateRequestStatus = (typeof AuthenticateRequestStatus)[keyof typeof AuthenticateRequestStatus];

export const authenticateRequestHandshake = async (
  req: Request,
  opts: WithAuthOptions,
): Promise<AuthenticateRequestResult> => {
  const clerkReq = createClerkRequest(req);
  const options = {
    ...opts,
    secretKey: opts.secretKey || SECRET_KEY,
    publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
    apiUrl: API_URL,
  };
  console.log('authenticateRequestHandshake', { options });

  if (clerkReq.headers.get('Authorization')) {
    return authenticateRequestWithAuthorizationHeader(clerkReq, options);
  }

  const handshakeResult = getHandshakeResult(clerkReq);
  if (handshakeResult) {
    return parseHandshakeResult(handshakeResult, options);
  }

  return authenticateRequestWithCookies(clerkReq, options);
};

/**
 * Init a handshake with Clerk FAPI by returning a 307 redirect to the /handshake endpoint.
 */
export const startHandshake = async (request: Request, _opts: WithAuthOptions) => {
  // TODO:
  const options = {
    ..._opts,
    secretKey: _opts.secretKey || SECRET_KEY,
    publishableKey: _opts.publishableKey || PUBLISHABLE_KEY,
    apiUrl: API_URL,
  };
  console.log('startHandshake', { options });
  const req = createClerkRequest(request);
  const parsedKey = parsePublishableKey(options.publishableKey);
  if (!parsedKey) {
    throw new Error('Invalid publishable key');
  }

  const url = new URL(`https://${parsedKey.frontendApi}`);
  url.pathname = joinPaths(url.pathname, API_VERSION, '/client/handshake');
  url.searchParams.set('redirect_url', req.clerkUrl.toString());

  const dbJwt = req.clerkUrl.searchParams.get('__clerk_db_jwt') || req.cookies.get('__clerk_db_jwt');
  if (dbJwt) {
    url.searchParams.set('__dev_session', dbJwt);
  }

  return Response.redirect(url, 307);
};

const getHandshakeResult = (req: ClerkRequest) => {
  return req.cookies.get('__clerk_handshake') || req.clerkUrl.searchParams.get('__clerk_handshake');
};

const parseHandshakeResult = async (handshakeResult: string, opts: WithAuthOptions) => {
  const cookiesToSet = JSON.parse(atob(handshakeResult)) as string[];
  const headersToSet = new Headers({
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Credentials': 'true',
  });
  let token = '';
  cookiesToSet.forEach((x: string) => {
    headersToSet.append('Set-Cookie', x);
    if (x.startsWith('__session=')) {
      token = x.split(';')[0].substring(10);
    }
  });

  if (token === '') {
    return { status: AuthenticateRequestStatus.SignedOut, headers: headersToSet };
  }

  try {
    await verifyRequestState(token, opts);
    return { status: AuthenticateRequestStatus.SignedIn, headers: headersToSet, handshakeToken: token };
  } catch (e: any) {
    return { status: AuthenticateRequestStatus.SignedOut, reason: e.reason };
  }
};

const authenticateRequestWithAuthorizationHeader = async (req: ClerkRequest, opts: WithAuthOptions) => {
  const authorizationHeader = req.headers.get('Authorization')!;
  const token = authorizationHeader.replace('Bearer ', '');
  try {
    await verifyRequestState(token, opts);
    return { status: AuthenticateRequestStatus.SignedIn };
  } catch (e: any) {
    return { status: AuthenticateRequestStatus.SignedOut, reason: e.reason };
  }
};

const authenticateRequestWithCookies = async (req: ClerkRequest, opts: WithAuthOptions) => {
  // DevBrowser Refresh
  const newDevBrowser = req.clerkUrl.searchParams.get('__clerk_db_jwt');
  if (newDevBrowser && newDevBrowser !== req.cookies.get('__clerk_db_jwt')) {
    return {
      status: AuthenticateRequestStatus.Handshake,
      reason: 'new-dev-browser',
      headers: new Headers({
        'Set-Cookie': serializeCookie('__dev_session', newDevBrowser, { path: '/' }),
      }),
    };
  }

  // Satellite handling
  // TODO

  const clientUatStr = req.cookies.get('__client_uat');
  const clientUat = clientUatStr ? parseInt(clientUatStr) : null;

  // This can eagerly run handshake since client_uat is SameSite=Strict in dev
  if (!clientUat) {
    return req.cookies.get('__session')
      ? { status: AuthenticateRequestStatus.Handshake, reason: 'cookie-token-unexpected' }
      : { status: AuthenticateRequestStatus.SignedOut };
  }

  if (clientUat > 0) {
    const token = req.cookies.get('__session');
    if (!token) {
      return { status: AuthenticateRequestStatus.Handshake, reason: 'cookie-token-missing' };
    }

    try {
      const jwt = await verifyRequestState(token, opts);
      return jwt.iat < clientUat
        ? { status: AuthenticateRequestStatus.Handshake, reason: 'cookie-token-stale' }
        : { status: AuthenticateRequestStatus.SignedIn };
    } catch (e) {
      return { status: AuthenticateRequestStatus.Handshake, reason: 'cookie-token-invalid' };
    }
  }

  return { status: AuthenticateRequestStatus.SignedOut, reason: 'unexpected' };
};

// TODO @nikos: this is a copy of the function from @clerk/backend
// rethink options
async function verifyRequestState(token: string, options: any) {
  const { isSatellite, proxyUrl } = options;
  let issuer;
  if (isSatellite) {
    issuer = null;
  } else if (proxyUrl) {
    issuer = proxyUrl;
  } else {
    issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');
  }

  return verifyToken(token, { ...options, issuer });
}

type AuthenticateRequestResult = {
  status: AuthenticateRequestStatus;
  reason?: string;
  headers?: Headers;
  handshakeToken?: string;
};
