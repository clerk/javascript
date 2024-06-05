import { NextRequest } from 'next/server';

const isPrerenderingBailout = (e: unknown) => {
  if (!(e instanceof Error) || !('message' in e)) {
    return false;
  }

  const { message } = e;

  const lowerCaseInput = message.toLowerCase();
  const dynamicServerUsage = lowerCaseInput.includes('dynamic server usage');
  const bailOutPrerendering = lowerCaseInput.includes('this page needs to bail out of prerendering');

  // note: new error message syntax introduced in next@14.1.1-canary.21
  // but we still want to support older versions.
  // https://github.com/vercel/next.js/pull/61332 (dynamic-rendering.ts:153)
  const routeRegex = /Route .*? needs to bail out of prerendering at this point because it used .*?./;

  return routeRegex.test(message) || dynamicServerUsage || bailOutPrerendering;
};

export const buildRequestLike = () => {
  try {
    // Dynamically import next/headers, otherwise Next12 apps will break
    // because next/headers was introduced in next@13
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { headers } = require('next/headers');
    return new NextRequest('https://placeholder.com', { headers: headers() });
  } catch (e: any) {
    // rethrow the error when react throws a prerendering bailout
    // https://nextjs.org/docs/messages/ppr-caught-error
    if (e && isPrerenderingBailout(e)) {
      throw e;
    }

    throw new Error(
      `Clerk: auth() and currentUser() are only supported in App Router (/app directory).\nIf you're using /pages, try getAuth() instead.\nOriginal error: ${e}`,
    );
  }
};
