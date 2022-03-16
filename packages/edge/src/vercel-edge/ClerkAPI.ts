import { ClerkBackendAPI } from '@clerk/backend-core';

import { PACKAGE_REPO } from '../constants';
import { LIB_NAME, LIB_VERSION } from '../info';

export const ClerkAPI = new ClerkBackendAPI({
  libName: LIB_NAME,
  libVersion: LIB_VERSION,
  packageRepo: PACKAGE_REPO,
  fetcher: (url, { method, authorization, contentType, userAgent, body }) => {
    return fetch(url, {
      method,
      headers: {
        authorization: authorization,
        'Content-Type': contentType,
        'User-Agent': userAgent,
        'X-Clerk-SDK': `vercel-edge/${LIB_VERSION}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    }).then(body => (contentType === 'text/html' ? body : body.json()));
  },
});
