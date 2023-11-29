import { verifyToken } from '@clerk/backend';
import { serialize as serializeCookie } from 'cookie';

import type { ClerkRequest } from './clerk-request';
import { createClerkRequest } from './clerk-request';
import type { WithAuthOptions } from './types';

export const AuthenticateRequestStatus = {
  SignedOut: 'signed-out',
  SignedIn: 'signed-in',
  Handshake: 'handshake',
} as const;

export type AuthenticateRequestStatus = (typeof AuthenticateRequestStatus)[keyof typeof AuthenticateRequestStatus];

const getHandshakeResult = (req: ClerkRequest) => {
  return req.cookies.get('__clerk_handshake') || req.clerkUrl.searchParams.get('__clerk_handshake');
};

const parseHandshakeResult = async (handshakeResult: string) => {
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
    await verifyToken(token, {} as any);
    return { status: AuthenticateRequestStatus.SignedIn, headers: headersToSet, handshakeToken: token };
  } catch (e) {
    return { status: AuthenticateRequestStatus.SignedOut, reason: 'handshake-token-invalid' };
  }
};

const authenticateRequestWithAuthorizationHeader = async (req: ClerkRequest, opts: WithAuthOptions) => {
  const authorizationHeader = req.headers.get('Authorization')!;
  const token = authorizationHeader.replace('Bearer ', '');
  try {
    await verifyRequestState(token, opts);
    return { status: AuthenticateRequestStatus.SignedIn };
  } catch (e) {
    return { status: AuthenticateRequestStatus.SignedOut, reason: 'header-token-invalid' };
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
        'Set-Cookie': serializeCookie('__clerk_db_jwt', newDevBrowser, { path: '/' }),
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

export const authenticateRequestHandshake = async (
  req: Request,
  opts: WithAuthOptions,
): Promise<AuthenticateRequestResult> => {
  const clerkReq = createClerkRequest(req);

  if (clerkReq.headers.get('Authorization')) {
    return authenticateRequestWithAuthorizationHeader(clerkReq, opts);
  }

  const handshakeResult = getHandshakeResult(clerkReq);
  if (handshakeResult) {
    return parseHandshakeResult(handshakeResult);
  }

  return authenticateRequestWithCookies(clerkReq, opts);
};
