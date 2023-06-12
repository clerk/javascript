import type { AuthenticateRequestOptions, AuthObject, SignedInAuthObject } from '@clerk/backend';
import type { MultiDomainAndOrProxy } from '@clerk/types';
import type { NextFunction, Request, Response } from 'express';

type LegacyAuthObject<T extends AuthObject> = Pick<T, 'sessionId' | 'userId' | 'actor' | 'getToken' | 'debug'> & {
  claims: AuthObject['sessionClaims'];
};

export type MiddlewareWithAuthProp = (
  // req: WithAuthProp<Request>
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type MiddlewareRequireAuthProp = (
  // req: RequireAuthProp<Request>,
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type LooseAuthProp = { auth: LegacyAuthObject<AuthObject> };
export type StrictAuthProp = { auth: LegacyAuthObject<SignedInAuthObject> };
export type WithAuthProp<T> = T & LooseAuthProp;
export type RequireAuthProp<T> = T & StrictAuthProp;

export type ClerkMiddleware = MiddlewareWithAuthProp | MiddlewareRequireAuthProp;
export type ClerkMiddlewareOptions = {
  onError?: (error: any) => unknown;
  authorizedParties?: string[];
  audience?: AuthenticateRequestOptions['audience'];
  jwtKey?: string;
  strict?: boolean;
  signInUrl?: string;
} & MultiDomainAndOrProxy;
