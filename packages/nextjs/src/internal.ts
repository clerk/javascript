/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export { MultisessionAppSupport } from './client-boundary/controlComponents';
/**
 * @deprecated Import `OAuthConsent` from `@clerk/nextjs` instead.
 */
export { OAuthConsent } from './client-boundary/uiComponents';
/**
 * @deprecated Import `useOAuthConsent` from `@clerk/nextjs` instead.
 */
export { useOAuthConsent } from '@clerk/shared/react';
