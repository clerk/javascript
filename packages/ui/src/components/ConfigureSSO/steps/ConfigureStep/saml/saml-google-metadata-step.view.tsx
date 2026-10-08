import { localizationKeys } from '@/customizables';

import { Step } from '../../../elements/Step';
import { InnerStepCounter } from '../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type SamlIdpConfigurationMode,
} from '../shared/IdentityProviderConfigurationModes';
import type { useSamlGoogleMetadataStepController } from './saml-google-metadata-step.controller';
import { IdentityProviderConfigurationForm } from './shared/IdentityProviderConfigurationForm';

const GOOGLE_IDP_MODES = ['metadataFile', 'manual'] as const satisfies readonly SamlIdpConfigurationMode[];

export const SamlGoogleMetadataStepView = ({
  mode,
  formProps,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleModeChange,
  handleContinue,
}: ReturnType<typeof useSamlGoogleMetadataStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.samlGoogle.mainHeaderTitle')}
        description={localizationKeys(
          'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.headerSubtitle',
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
            modes={GOOGLE_IDP_MODES}
            value={mode}
            onChange={handleModeChange}
            labels={{
              ariaLabel: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.ariaLabel',
              ),
              metadataFile: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.metadataFile',
              ),
              manual: localizationKeys(
                'configureSSO.configureStep.samlGoogle.identityProviderMetadataStep.modes.manual',
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
