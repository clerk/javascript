import type { AuthObject, createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInAuthObject } from '@clerk/backend/internal';
import type { MultiDomainAndOrProxy } from '@clerk/types';
import type { NextFunction, Request, Response } from 'express';
import type { IncomingMessage } from 'http';

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

export type LooseAuthProp = { auth: AuthObject };
export type StrictAuthProp = { auth: SignedInAuthObject };
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

export type ClerkClient = ReturnType<typeof createClerkClient>;

export type AuthenticateRequestParams = {
  clerkClient: ClerkClient;
  publishableKey?: string;
  secretKey?: string;
  req: IncomingMessage;
  options?: ClerkMiddlewareOptions;
};
