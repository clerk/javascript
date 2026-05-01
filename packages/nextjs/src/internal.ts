/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
import { useOAuthConsent as useOAuthConsentOriginal } from '@clerk/shared/react';

import { OAuthConsent as OAuthConsentOriginal } from './client-boundary/uiComponents';

export { MultisessionAppSupport } from './client-boundary/controlComponents';

/**
 * @deprecated Import `OAuthConsent` from `@clerk/nextjs` instead.
 */
const OAuthConsent = OAuthConsentOriginal;
export { OAuthConsent };

/**
 * @deprecated Import `useOAuthConsent` from `@clerk/nextjs` instead.
 */
const useOAuthConsent = useOAuthConsentOriginal;
export { useOAuthConsent };
