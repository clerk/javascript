import { localizationKeys } from '@/customizables';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type SamlIdpConfigurationMode,
} from '../shared/IdentityProviderConfigurationModes';
import type { useSamlMicrosoftMetadataStepController } from './saml-microsoft-metadata-step.controller';
import { IdentityProviderConfigurationForm } from './shared/IdentityProviderConfigurationForm';

const MICROSOFT_SAML_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];

export const SamlMicrosoftMetadataStepView = ({
  mode,
  formProps,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleModeChange,
  handleContinue,
}: ReturnType<typeof useSamlMicrosoftMetadataStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlMicrosoft.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.headerSubtitle',
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
            modes={MICROSOFT_SAML_IDP_MODES}
            value={mode}
            onChange={handleModeChange}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlMicrosoft.identityProviderMetadataStep.modes.manual',
              ),
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
