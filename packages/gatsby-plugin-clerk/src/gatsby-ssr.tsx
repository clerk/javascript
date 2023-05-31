import type { GatsbySSR } from 'gatsby';
import React from 'react';

import { ClerkProvider } from './GatsbyClerkProvider';

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element, props }, pluginOptions) => {
  let clerkSsrState: any;
  if ((props.serverData as any)?.clerkState) {
    clerkSsrState = (props.serverData as any).clerkState;
    delete (props.serverData as any).clerkState;
  }

  return (
    // @ts-expect-error
    <ClerkProvider
      frontendApi={process.env.GATSBY_CLERK_FRONTEND_API || ''}
      publishableKey={process.env.GATSBY_CLERK_PUBLISHABLE_KEY || ''}
      clerkJSUrl={process.env.GATSBY_CLERK_JS}
      proxyUrl={process.env.GATSBY_CLERK_PROXY_URL}
      clerkState={clerkSsrState || {}}
      {...pluginOptions}
    >
      {element}
    </ClerkProvider>
  );
};
