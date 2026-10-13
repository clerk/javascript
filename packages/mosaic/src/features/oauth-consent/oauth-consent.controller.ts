import { useState } from 'react';

import { fill } from '../../localization';
import type { OAuthConsentMessages, OAuthConsentReadyModel, OAuthConsentViewProps } from './oauth-consent.types';

const PRIVATE_METADATA_SCOPE = 'private_metadata';

export function useOAuthConsentController(
  { status: _status, scopes, defaultOrganizationId, ...model }: OAuthConsentReadyModel,
  messages: OAuthConsentMessages,
): OAuthConsentViewProps {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isRedirectUrlOpen, setIsRedirectUrlOpen] = useState(false);

  return {
    ...model,
    messages,
    scopes: scopes.map(({ scope, description }) => ({
      scope,
      label:
        scope === PRIVATE_METADATA_SCOPE
          ? fill(messages.privateMetadata, { applicationName: model.applicationName })
          : description || scope,
    })),
    organizationId: selectedOrganizationId ?? defaultOrganizationId,
    onOrganizationChange: setSelectedOrganizationId,
    isRedirectUrlOpen,
    onRedirectUrlOpenChange: setIsRedirectUrlOpen,
  };
}
