import type { OAuthClientRegistration } from '@clerk/shared/types';

import { localizationKeys } from '@/ui/customizables';

type ClientIdentityNotice = {
  localizationKey: ReturnType<typeof localizationKeys>;
  colorScheme: 'warning' | 'secondary';
};

export function getClientIdentityNotice(
  registration: OAuthClientRegistration | undefined,
  metadataHost: string | null | undefined,
): ClientIdentityNotice | null {
  switch (registration) {
    case undefined:
    case 'preregistered':
      return null;
    case 'dynamic':
      return {
        localizationKey: localizationKeys('oauthConsent.clientIdentity.dynamic'),
        colorScheme: 'warning',
      };
    case 'metadata_document':
      if (!metadataHost) {
        return null;
      }
      return {
        localizationKey: localizationKeys('oauthConsent.clientIdentity.metadataDocument', { metadataHost }),
        colorScheme: 'secondary',
      };
    default: {
      const _exhaustive: never = registration;
      void _exhaustive;
      return null;
    }
  }
}
