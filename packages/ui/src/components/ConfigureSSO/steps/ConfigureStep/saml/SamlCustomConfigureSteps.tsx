import type { JSX } from 'react';

import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { SamlCustomAssignUsersStep } from './SamlCustomAssignUsersStep';
import { SamlCustomAttributeMappingStep } from './SamlCustomAttributeMappingStep';
import { SamlCustomCreateAppStep } from './SamlCustomCreateAppStep';
import { SamlCustomIdentityProviderMetadataStep } from './SamlCustomIdentityProviderMetadataStep';

const CUSTOM_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'attribute-mapping' },
  { id: 'assign-users' },
  { id: 'identity-provider-metadata' },
];

export const SamlCustomConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={CUSTOM_STEPS}
      initialStepId={CUSTOM_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlCustomCreateAppStep />
      </Wizard.Match>

      <Wizard.Match id='attribute-mapping'>
        <SamlCustomAttributeMappingStep />
      </Wizard.Match>

      <Wizard.Match id='assign-users'>
        <SamlCustomAssignUsersStep />
      </Wizard.Match>

      <Wizard.Match id='identity-provider-metadata'>
        <SamlCustomIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
  );
};
