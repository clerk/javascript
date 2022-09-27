import { NextRequest } from 'next/server';

import { AUTH_RESULT, RequestLike } from '../types';

type RequestProps = {
  req: NextRequest;
  authResult: string;
};

export function setAuthResultOnRequest({ req, authResult }: RequestProps): void {
  req.headers.set(AUTH_RESULT, authResult);
  req.nextUrl.searchParams.set(AUTH_RESULT, authResult);
}

// Tries to extract auth result from the request using several strategies
export function getAuthResultFromRequest(req: RequestLike): string | null | undefined {
  return getQueryParam(req, AUTH_RESULT) || getHeader(req, AUTH_RESULT);
}

function getQueryParam(req: RequestLike, name: string): string | null | undefined {
  if (req instanceof NextRequest) {
    return req.nextUrl.searchParams.get(name);
  }

  // Check if the request contains a parsed query object
  // NextApiRequest does, but the IncomingMessage in the GetServerSidePropsContext case does not

  let queryParam: string | null | undefined;

  if ('query' in req) {
    queryParam = req.query[name] as string | undefined;
  }

  // Fall back to query string
  if (!queryParam) {
    const qs = (req.url || '').split('?')[1];
    const searchParams = new URLSearchParams(qs);
    queryParam = searchParams.get(name);
  }

  return queryParam;
}

export function getHeader(req: RequestLike, name: string): string | null | undefined {
  if (req instanceof NextRequest) {
    return req.headers.get(name);
  }

  let header = req.headers[name] as string | undefined;

  // If no header has been determined for IncomingMessage case, check if available within private headers
  if (!header) {
    // @ts-ignore
    header = req.socket?._httpMessage?.getHeader(name);
  }

  return header;
}

export function getCookie(req: RequestLike, name: string): string | undefined {
  if (req instanceof NextRequest) {
    return req.cookies.get(name);
  }

  return req.cookies[name];
}
