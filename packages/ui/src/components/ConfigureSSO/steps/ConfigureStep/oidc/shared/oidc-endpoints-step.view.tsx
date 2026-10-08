import { localizationKeys } from '@/customizables';

import { Step } from '../../../../elements/Step';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';
import { ActiveConnectionAlert } from '../../shared/ActiveConnectionAlert';
import {
  IdentityProviderConfigurationModes,
  type OidcIdpConfigurationMode,
} from '../../shared/IdentityProviderConfigurationModes';
import type { useOidcEndpointsStepController } from './oidc-endpoints-step.controller';
import { OidcEndpointsConfigurationForm } from './OidcEndpointsConfigurationForm';

const OIDC_ENDPOINT_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly OidcIdpConfigurationMode[];

export const OidcEndpointsStepView = ({
  mode,
  formProps,
  isSubmitting,
  canSubmit,
  goPrev,
  isFirstStep,
  handleModeChange,
  handleContinue,
}: ReturnType<typeof useOidcEndpointsStepController>): JSX.Element => {
  return (
    <>
      <Step.Header
        title={localizationKeys('configureSSO.configureStep.oidcCustom.mainHeaderTitle')}
        description={localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.headerSubtitle')}
      >
        <InnerStepCounter />
      </Step.Header>

      <Step.Body>
        <Step.Section
          fill
          gap={5}
        >
          <IdentityProviderConfigurationModes
            modes={OIDC_ENDPOINT_MODES}
            value={mode}
            onChange={handleModeChange}
            labels={{
              ariaLabel: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.ariaLabel'),
              discoveryUrl: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.discoveryUrl'),
              manual: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.manual'),
            }}
          />

          <OidcEndpointsConfigurationForm {...formProps} />
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
