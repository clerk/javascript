import type { JSX } from 'react';

import { Wizard, type WizardStepConfig } from '../../../elements/Wizard';
import { SamlOktaAssignUsersStep } from './SamlOktaAssignUsersStep';
import { SamlOktaAttributeMappingStep } from './SamlOktaAttributeMappingStep';
import { SamlOktaCreateAppStep } from './SamlOktaCreateAppStep';
import { SamlOktaIdentityProviderMetadataStep } from './SamlOktaIdentityProviderMetadataStep';

const OKTA_STEPS: WizardStepConfig[] = [
  { id: 'create-app' },
  { id: 'attribute-mapping' },
  { id: 'assign-users' },
  { id: 'identity-provider-metadata' },
];

export const SamlOktaConfigureSteps = (): JSX.Element => {
  return (
    // Linear, guard-less sub-flow: mount on the first step. (Entry guards drive
    // furthest-reachable init, which would otherwise land the last step here.)
    <Wizard
      steps={OKTA_STEPS}
      initialStepId={OKTA_STEPS[0].id}
    >
      <Wizard.Match id='create-app'>
        <SamlOktaCreateAppStep />
      </Wizard.Match>
      <Wizard.Match id='attribute-mapping'>
        <SamlOktaAttributeMappingStep />
      </Wizard.Match>
      <Wizard.Match id='assign-users'>
        <SamlOktaAssignUsersStep />
      </Wizard.Match>
      <Wizard.Match id='identity-provider-metadata'>
        <SamlOktaIdentityProviderMetadataStep />
      </Wizard.Match>
    </Wizard>
  );
};
