import React, { type JSX } from 'react';

import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { OidcClaimsStep } from './shared/OidcClaimsStep';
import { OidcCredentialsStep } from './shared/OidcCredentialsStep';
import { OidcEndpointsStep } from './shared/OidcEndpointsStep';
import { OidcRedirectUriStep } from './shared/OidcRedirectUriStep';

const OIDC_STEPS: WizardStepConfig[] = [
  { id: 'redirect-uri' },
  { id: 'claims' },
  { id: 'endpoints' },
  { id: 'credentials' },
];

export const OidcCustomConfigureSteps = (): JSX.Element => {
  return (
    <Wizard
      steps={OIDC_STEPS}
      initialStepId={OIDC_STEPS[0].id}
    >
      <Wizard.Match id='redirect-uri'>
        <OidcRedirectUriStep />
      </Wizard.Match>

      <Wizard.Match id='claims'>
        <OidcClaimsStep />
      </Wizard.Match>

      <Wizard.Match id='endpoints'>
        <OidcEndpointsStep />
      </Wizard.Match>

      <Wizard.Match id='credentials'>
        <OidcCredentialsStep />
      </Wizard.Match>
    </Wizard>
  );
};
