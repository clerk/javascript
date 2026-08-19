import { createContext, useContext } from 'react';

import type { OAuthDeviceVerificationCtx } from '../../types';

export const OAuthDeviceVerificationContext = createContext<OAuthDeviceVerificationCtx | null>(null);

export const useOAuthDeviceVerificationContext = () => {
  const context = useContext(OAuthDeviceVerificationContext);

  if (context === null) {
    throw new Error(
      'Clerk: useOAuthDeviceVerificationContext called outside of the mounted OAuthDeviceVerification component.',
    );
  }

  return context;
};
