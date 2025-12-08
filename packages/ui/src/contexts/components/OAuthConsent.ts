import { createContext, useContext } from 'react';

import type { OAuthConsentCtx } from '../../types';

export const OAuthConsentContext = createContext<OAuthConsentCtx | null>(null);

export const useOAuthConsentContext = () => {
  const context = useContext(OAuthConsentContext);

  if (context === null) {
    throw new Error('Clerk: useOAuthConsentContext called outside of the mounted OAuthConsent component.');
  }

  return context;
};
