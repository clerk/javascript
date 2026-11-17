import type { OAuthClientRegistration } from '@clerk/shared/types';

import { localizationKeys } from '@/ui/customizables';

type ClientIdentityNotice = {
  localizationKey: ReturnType<typeof localizationKeys>;
  colorScheme: 'warning' | 'secondary';
};

/**
 * Describes how the requesting client's identity was established, so users can
 * tell a self-named client (Dynamic Client Registration) apart from one whose
 * details are published by a host (Client ID Metadata Document).
 * Returns null when there is nothing to add for the user.
 */
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
      // Compile-time exhaustiveness only. The backend ships separately from the
      // SDK, so an unknown value at runtime must not break the consent page.
      const _exhaustive: never = registration;
      void _exhaustive;
      return null;
    }
  }
}
