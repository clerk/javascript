import type { JSX } from 'react';

import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { SamlMicrosoftAttributeMappingStep } from './SamlMicrosoftAttributeMappingStep';
import { SamlMicrosoftCreateAppStep } from './SamlMicrosoftCreateAppStep';
import { SamlMicrosoftIdentityProviderMetadataStep } from './SamlMicrosoftIdentityProviderMetadataStep';
import { SamlMicrosoftServiceProviderStep } from './SamlMicrosoftServiceProviderStep';

const MICROSOFT_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'service-provider' },
  { id: 'attribute-mapping' },
  { id: 'identity-provider-metadata' },
];

export const SamlMicrosoftConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={MICROSOFT_STEPS}
      initialStepId={MICROSOFT_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlMicrosoftCreateAppStep />
      </Wizard.Match>
      <Wizard.Match id='service-provider'>
        <SamlMicrosoftServiceProviderStep />
      </Wizard.Match>
      <Wizard.Match id='attribute-mapping'>
        <SamlMicrosoftAttributeMappingStep />
      </Wizard.Match>
      <Wizard.Match id='identity-provider-metadata'>
        <SamlMicrosoftIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
  );
};
