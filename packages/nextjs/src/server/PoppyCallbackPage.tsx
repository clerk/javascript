import { poppyCookies } from '@clerk/backend';
import { constants } from '@clerk/backend/internal';
import { cookies, headers } from 'next/headers';
import React from 'react';

import { PoppyCallback } from '../app-router/client/PoppyCallback';
import { decryptClerkRequestData } from './utils';

export async function PoppyCallbackPage() {
  const requestHeaders = await headers();
  const options = decryptClerkRequestData(requestHeaders.get(constants.Headers.ClerkRequestData));
  const endpoint = options.__experimental_poppy && new URL(options.__experimental_poppy.browserSessionEndpoint);
  const currentUrl = requestHeaders.get(constants.Headers.ClerkUrl);
  if (!endpoint || !currentUrl || new URL(currentUrl).href !== endpoint.href + '/callback') {
    throw new Error('The Poppy callback requires its configured Clerk middleware route.');
  }
  const ticket = (await cookies()).get(poppyCookies.ticket)?.value;
  if (!ticket) {
    return <p>Start the browser connection again.</p>;
  }
  const redirect = new URL(options.__experimental_poppy?.redirectTo ?? '/', endpoint);
  if (redirect.origin !== endpoint.origin || redirect.username || redirect.password) {
    throw new Error('The browser Session redirect must stay on the Company origin.');
  }
  return (
    <PoppyCallback
      ticket={ticket}
      redirectTo={redirect.href}
    />
  );
}
