import type { GatsbySSR } from 'gatsby';
import React from 'react';

import { CLERK_JS, PROXY_URL, PUBLISHABLE_KEY } from './constants';
import { ClerkProvider } from './GatsbyClerkProvider';

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element, props }, pluginOptions) => {
  let clerkSsrState: any;
  if ((props.serverData as any)?.clerkState) {
    clerkSsrState = (props.serverData as any).clerkState;
    delete (props.serverData as any).clerkState;
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      clerkJSUrl={CLERK_JS}
      proxyUrl={PROXY_URL}
      clerkState={clerkSsrState || {}}
      {...pluginOptions}
    >
      {element}
    </ClerkProvider>
  );
};
