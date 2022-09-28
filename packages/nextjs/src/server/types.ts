import { AuthErrorReason, ClerkBackendAPI } from '@clerk/backend-core';
import { ClerkJWTClaims, ServerGetToken } from '@clerk/types';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export const SESSION_COOKIE_NAME = '__session';
export const AUTH_RESULT = 'Auth-Result';
export const NEXT_REWRITE_HEADER = 'x-middleware-rewrite';
export const NEXT_RESUME_HEADER = 'x-middleware-next';
export const NEXT_REDIRECT_HEADER = 'Location';

export type AuthData = {
  sessionId: string | null;
  userId: string | null;
  orgId: string | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
};

enum AuthResultExt {
  StandardSignedIn = 'standard-signed-in',
}

export const AuthResult = { ...AuthResultExt, ...AuthErrorReason };
export type AuthResult = typeof AuthResult;

export type SessionsApi = InstanceType<typeof ClerkBackendAPI>['sessions'];
export type OrganizationsApi = InstanceType<typeof ClerkBackendAPI>['organizations'];
export type UsersApi = InstanceType<typeof ClerkBackendAPI>['users'];
