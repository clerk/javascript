import type { GatsbyBrowser } from 'gatsby';
import React from 'react';

import { ClerkProvider } from './GatsbyClerkProvider';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element, props }, options) => {
  const clerkSsrState = (props.serverData as any)?.clerkState || {};

  return (
    <ClerkProvider
      clerkState={clerkSsrState}
      {...(options as any)}
    >
      {element}
    </ClerkProvider>
  );
};
