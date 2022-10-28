import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { buildClerkProps, getAuth } from '../../server';

// Warning: This is insecure unless withClerkMiddleware has run

// We cannot currently detect if withClerkMiddleware has run for
// the appDir, so we can't throw an error if they misconfigure
// middleware, which would make this strategy quite insecure.

// Track resolution here - looks like it will be in 13.0.1:
// https://github.com/vercel/next.js/pull/41380

function buildReqLike() {
  const session = cookies().get('__session');
  if (session) {
    return new NextRequest('https://example.com', {
      headers: new Headers({
        'auth-result': 'standard-signed-in',
        authorization: `Bearer ${session}`,
      }),
    });
  }

  return new NextRequest('https://example.com', {
    headers: new Headers({
      'auth-result': 'standard-signed-out',
    }),
  });
}

export function auth() {
  return getAuth(buildReqLike());
}

export function initialState() {
  return buildClerkProps(buildReqLike());
}
