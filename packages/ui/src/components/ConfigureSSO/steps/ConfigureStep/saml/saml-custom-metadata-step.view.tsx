import { localizationKeys } from '@/customizables';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type SamlIdpConfigurationMode,
} from '../shared/IdentityProviderConfigurationModes';
import type { useSamlCustomMetadataStepController } from './saml-custom-metadata-step.controller';
import { IdentityProviderConfigurationForm } from './shared/IdentityProviderConfigurationForm';

const CUSTOM_SAML_IDP_MODES = ['metadataUrl', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];

export const SamlCustomMetadataStepView = ({
  mode,
  formProps,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleModeChange,
  handleContinue,
}: ReturnType<typeof useSamlCustomMetadataStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlCustom.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.headerSubtitle',
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
            modes={CUSTOM_SAML_IDP_MODES}
            value={mode}
            onChange={handleModeChange}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataUrl: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.metadataUrl',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.modes.manual',
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
