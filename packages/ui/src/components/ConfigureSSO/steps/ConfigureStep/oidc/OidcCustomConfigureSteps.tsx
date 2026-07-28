import { type JSX, useState } from 'react';

import { useConfigureSSO } from '../../../ConfigureSSOContext';
import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import type { OidcIdpConfigurationMode } from '../shared/IdentityProviderConfigurationModes';
import { OidcCredentialsStep } from './shared/OidcCredentialsStep';
import { OidcEndpointsStep } from './shared/OidcEndpointsStep';
import { OidcRedirectUriStep } from './shared/OidcRedirectUriStep';

const OIDC_STEPS: WizardStepConfig[] = [{ id: 'redirect-uri' }, { id: 'endpoints' }, { id: 'credentials' }];

export const OidcCustomConfigureSteps = (): JSX.Element => {
  const { enterpriseConnection } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;
  // Keep mode outside the step so it persists across wizard navigation.
  const [endpointMode, setEndpointMode] = useState<OidcIdpConfigurationMode>(
    oauthConfig?.authUrl && !oauthConfig.discoveryUrl ? 'manual' : 'discoveryUrl',
  );

  return (
    <Wizard
      steps={OIDC_STEPS}
      initialStepId={OIDC_STEPS[0].id}
    >
      <Wizard.Match id='redirect-uri'>
        <OidcRedirectUriStep />
      </Wizard.Match>

      <Wizard.Match id='endpoints'>
        <OidcEndpointsStep
          mode={endpointMode}
          onModeChange={setEndpointMode}
        />
      </Wizard.Match>

      <Wizard.Match id='credentials'>
        <OidcCredentialsStep />
      </Wizard.Match>
    </Wizard>
  );
};
