import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';

/**
 * A function that merges two Response objects into a single response.
 * The final response respects the body and the status of the last response,
 * but the cookies and headers of all responses are merged.
 */
export const mergeResponses = (...responses: (NextResponse | Response | null | undefined | void)[]) => {
  const normalisedResponses = responses.filter(Boolean).map(res => {
    // If the response is a NextResponse, we can just return it
    if (res instanceof NextResponse) {
      return res;
    }

    return new NextResponse(res!.body, res!);
  });

  if (normalisedResponses.length === 0) {
    return;
  }

  const lastResponse = normalisedResponses[normalisedResponses.length - 1];
  const finalResponse = new NextResponse(lastResponse.body, lastResponse);

  for (const response of normalisedResponses) {
    response.headers.forEach((value: string, name: string) => {
      finalResponse.headers.set(name, value);
    });

    response.cookies.getAll().forEach(cookie => {
      const { name, value, ...options } = cookie;

      finalResponse.cookies.set(name, value, options);
    });
  }

  return finalResponse;
};

export const isRedirect = (res: Response) => {
  return res.headers.get(nextConstants.Headers.NextRedirect);
};

export const setHeader = (res: Response, name: string, val: string) => {
  res.headers.set(name, val);
  return res;
};

export const stringifyHeaders = (headers: { forEach: Headers['forEach'] }) => {
  if (!headers) {
    return JSON.stringify({});
  }

  const obj: Record<string, string> = {};
  headers.forEach((value, name) => {
    obj[name] = value;
  });
  return JSON.stringify(obj);
};
