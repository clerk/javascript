import type { AuthObject, OptionalVerifyTokenOptions } from '@clerk/backend';
import type { MultiDomainAndOrProxy, PublishableKeyOrFrontendApi, SecretKeyOrApiKey } from '@clerk/types';
import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextMiddleware, NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export type WithAuthOptions = Partial<PublishableKeyOrFrontendApi> &
  Partial<SecretKeyOrApiKey> &
  OptionalVerifyTokenOptions &
  MultiDomainAndOrProxy & {
    signInUrl?: string;
  };

export type NextMiddlewareResult = Awaited<ReturnType<NextMiddleware>>;

export type AuthObjectWithDeprecatedResources<T extends AuthObject> = Omit<T, 'user' | 'organization' | 'session'> & {
  /**
   * @deprecated This will be removed in the next major version
   */
  user: T['user'];
  /**
   * @deprecated This will be removed in the next major version
   */
  organization: T['organization'];
  /**
   * @deprecated This will be removed in the next major version
   */
  session: T['session'];
};
