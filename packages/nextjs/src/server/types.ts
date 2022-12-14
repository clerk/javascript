import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & {
  cookies: NextApiRequestCookies;
};

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;
