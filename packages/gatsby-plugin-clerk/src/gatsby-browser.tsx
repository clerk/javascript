import type { GatsbyBrowser } from 'gatsby';
import React from 'react';

import { ClerkProvider } from './GatsbyClerkProvider';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element, props }) => {
  let clerkSsrState: any;
  if ((props.serverData as any)?.clerkState) {
    clerkSsrState = (props.serverData as any).clerkState;
    delete (props.serverData as any).clerkState;
  }

  return (
    <ClerkProvider
      frontendApi={process.env.GATSBY_CLERK_FRONTEND_API || ''}
      publishableKey={process.env.GATSBY_CLERK_PUBLISHABLE_KEY || ''}
      clerkJSUrl={process.env.GATSBY_CLERK_JS}
      // @ts-expect-error
      proxyUrl={process.env.GATSBY_CLERK_PROXY_URL}
      clerkState={clerkSsrState || {}}
    >
      {element}
    </ClerkProvider>
  );
};
