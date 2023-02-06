import type { OptionalVerifyTokenOptions } from '@clerk/backend';
import type { ClerkOptions } from '@clerk/types';
import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export type WithAuthOptions = OptionalVerifyTokenOptions;
export type WithAuthOptionsExperimental = WithAuthOptions & {
  isSatellite?: ClerkOptions['isSatellite'];
};
