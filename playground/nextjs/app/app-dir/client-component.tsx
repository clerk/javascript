'use client';

import React from 'react';
import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/nextjs/errors';

export const ClientComponent = () => {
  React.useEffect(() => {
    console.log({ isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError });
  });
  return <div>Client Component</div>;
};
