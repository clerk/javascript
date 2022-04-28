import type { GatsbyBrowser } from 'gatsby';
import React from 'react';

import { ClerkProvider } from './GatsbyClerkProvider';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element, props }, options) => {
  let clerkSsrState: any;
  if ((props.serverData as any)?.clerkState) {
    clerkSsrState = (props.serverData as any).clerkState;
    delete (props.serverData as any).clerkState;
  }

  return (
    <ClerkProvider
      clerkState={clerkSsrState || {}}
      {...(options as any)}
    >
      {element}
    </ClerkProvider>
  );
};
