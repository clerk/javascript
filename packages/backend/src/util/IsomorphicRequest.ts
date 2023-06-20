import { parse } from 'cookie';

import runtime from '../runtime';

type IsomorphicRequestOptions = {
  headers?: Record<string, string> | any;
};

export const createIsomorphicRequest = (url: string | URL, reqOpts?: IsomorphicRequestOptions): Request => {
  const headers = reqOpts?.headers;
  // if (!!reqOpts?.headers && typeof headers.forEach === 'function') {
  //   headers = {};
  //   reqOpts?.headers.forEach((value: string, key: string) => {
  //     headers = Object.assign(headers, { [key]: value });
  //   });
  // }
  return new runtime.Request(url, { ...reqOpts, headers });
};

const decode = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

export const parseIsomorphicRequestCookies = (req: Request) => {
  const cookies = req.headers && req.headers?.get('cookie') ? parse(req.headers.get('cookie') as string) : {};
  return (key: string): string | undefined => {
    const value = cookies?.[key];
    if (value === undefined) {
      return undefined;
    }
    return decode(value);
  };
};
