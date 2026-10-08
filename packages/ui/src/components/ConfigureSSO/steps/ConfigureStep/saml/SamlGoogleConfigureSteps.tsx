import type { JSX } from 'react';

import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { SamlGoogleAttributeMappingStep } from './SamlGoogleAttributeMappingStep';
import { SamlGoogleConfigureUserAccessStep } from './SamlGoogleConfigureUserAccessStep';
import { SamlGoogleCreateAppStep } from './SamlGoogleCreateAppStep';
import { SamlGoogleIdentityProviderMetadataStep } from './SamlGoogleIdentityProviderMetadataStep';
import { SamlGoogleServiceProviderStep } from './SamlGoogleServiceProviderStep';

const GOOGLE_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'identity-provider-metadata' },
  { id: 'service-provider' },
  { id: 'attribute-mapping' },
  { id: 'configure-user-access' },
];

export const SamlGoogleConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={GOOGLE_STEPS}
      initialStepId={GOOGLE_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlGoogleCreateAppStep />
      </Wizard.Match>
      <Wizard.Match id='identity-provider-metadata'>
        <SamlGoogleIdentityProviderMetadataStep />
      </Wizard.Match>
      <Wizard.Match id='service-provider'>
        <SamlGoogleServiceProviderStep />
      </Wizard.Match>
      <Wizard.Match id='attribute-mapping'>
        <SamlGoogleAttributeMappingStep />
      </Wizard.Match>
      <Wizard.Match id='configure-user-access'>
        <SamlGoogleConfigureUserAccessStep />
      </Wizard.Match>
    </Wizard>
  );
};
