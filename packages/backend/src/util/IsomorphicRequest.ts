import { parse } from 'cookie';

import runtime from '../runtime';

type IsomorphicRequestOptions = (Request: typeof runtime.Request, Headers: typeof runtime.Headers) => Request;
export const createIsomorphicRequest = (cb: IsomorphicRequestOptions): Request => {
  return cb(runtime.Request, runtime.Headers);
};

export const buildRequest = (req?: Request) => {
  if (!req) {
    return {};
  }
  const cookies = parseIsomorphicRequestCookies(req);
  const headers = getHeaderFromIsomorphicRequest(req);
  const searchParams = getSearchParamsFromIsomorphicRequest(req);

  return {
    cookies,
    headers,
    searchParams,
  };
};

const decode = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

const parseIsomorphicRequestCookies = (req: Request) => {
  const cookies = req.headers && req.headers?.get('cookie') ? parse(req.headers.get('cookie') as string) : {};
  return (key: string): string | undefined => {
    const value = cookies?.[key];
    if (value === undefined) {
      return undefined;
    }
    return decode(value);
  };
};

const getHeaderFromIsomorphicRequest = (req: Request) => (key: string) => req?.headers?.get(key) || undefined;

const getSearchParamsFromIsomorphicRequest = (req: Request) => (req?.url ? new URL(req.url)?.searchParams : undefined);

export const stripAuthorizationHeader = (authValue: string | undefined | null): string | undefined => {
  return authValue?.replace('Bearer ', '');
};
