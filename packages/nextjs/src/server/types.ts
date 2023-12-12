import type { AuthObject, OptionalVerifyTokenOptions } from '@clerk/backend';
import type { MultiDomainAndOrProxy } from '@clerk/types';
import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextMiddleware, NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export type WithAuthOptions = OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    publishableKey?: string;
    secretKey?: string;
    signInUrl?: string;
  };

export type NextMiddlewareResult = Awaited<ReturnType<NextMiddleware>>;

export type AuthObjectWithoutResources<T extends AuthObject> = Omit<T, 'user' | 'organization' | 'session'>;
