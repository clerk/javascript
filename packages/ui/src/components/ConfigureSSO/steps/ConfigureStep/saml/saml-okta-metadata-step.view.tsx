import { localizationKeys } from '@/customizables';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type SamlIdpConfigurationMode,
} from '../shared/IdentityProviderConfigurationModes';
import type { useSamlOktaMetadataStepController } from './saml-okta-metadata-step.controller';
import { IdentityProviderConfigurationForm } from './shared/IdentityProviderConfigurationForm';

const OKTA_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];

export const SamlOktaMetadataStepView = ({
  mode,
  formProps,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleModeChange,
  handleContinue,
}: ReturnType<typeof useSamlOktaMetadataStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlOkta.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.headerSubtitle',
        )}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <IdentityProviderConfigurationModes
            modes={OKTA_IDP_MODES}
            value={mode}
            onChange={handleModeChange}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys('configureSSO.configureStep.samlOkta.identityProviderMetadataStep.modes.manual'),
            }}
          />
          <IdentityProviderConfigurationForm {...formProps} />
          <ActiveConnectionAlert />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={goPrev}
          isDisabled={isFirstStep || isSubmitting}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={isSubmitting}
          isDisabled={!canSubmit}
        />
      </Step.Footer>
    </>
  );
};
