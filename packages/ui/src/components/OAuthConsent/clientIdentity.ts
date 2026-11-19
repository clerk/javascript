import type { OAuthClientRegistration } from '@clerk/shared/types';

import { localizationKeys } from '@/ui/customizables';

export function getClientIdentityNotice(
  registration: OAuthClientRegistration | undefined,
  metadataHost: string | null | undefined,
  applicationName: string,
): ReturnType<typeof localizationKeys> | null {
  switch (registration) {
    case undefined:
    case 'preregistered':
      return null;
    case 'dynamic':
      return localizationKeys('oauthConsent.clientIdentity.dynamic', { applicationName });
    case 'metadata_document':
      if (!metadataHost) {
        return null;
      }
      return localizationKeys('oauthConsent.clientIdentity.metadataDocument', { metadataHost });
    default: {
      const _exhaustive: never = registration;
      void _exhaustive;
      return null;
    }
  }
}
