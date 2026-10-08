import { useState } from 'react';

import type { OidcIdpConfigurationMode } from '../shared/IdentityProviderConfigurationModes';

export const useOidcCustomConfigureStepsController = (initialMode: OidcIdpConfigurationMode) => {
  // Keep mode outside the step so it persists across wizard navigation.
  const [endpointMode, setEndpointMode] = useState<OidcIdpConfigurationMode>(initialMode);
  return { endpointMode, setEndpointMode };
};
