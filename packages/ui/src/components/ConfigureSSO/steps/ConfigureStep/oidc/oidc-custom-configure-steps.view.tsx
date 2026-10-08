import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import type { useOidcCustomConfigureStepsController } from './oidc-custom-configure-steps.controller';
import { OidcCredentialsStep } from './shared/OidcCredentialsStep';
import { OidcEndpointsStep } from './shared/OidcEndpointsStep';
import { OidcRedirectUriStep } from './shared/OidcRedirectUriStep';

const OIDC_STEPS: WizardStepConfig[] = [{ id: 'redirect-uri' }, { id: 'endpoints' }, { id: 'credentials' }];

export const OidcCustomConfigureStepsView = ({
  endpointMode,
  setEndpointMode,
}: ReturnType<typeof useOidcCustomConfigureStepsController>): JSX.Element => (
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
      <OidcCredentialsStep mode={endpointMode} />
    </Wizard.Match>
  </Wizard>
);
