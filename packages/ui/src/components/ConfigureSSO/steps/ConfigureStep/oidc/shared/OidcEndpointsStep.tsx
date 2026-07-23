import React, { type JSX } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';
import { Step } from '../../../../elements/Step';
import { useWizard } from '../../../../elements/Wizard';
import { InnerStepCounter } from '../../../../elements/Wizard/InnerStepCounter';
import {
  IdentityProviderConfigurationModes,
  type IdpConfigurationMode,
} from '../shared/IdentityProviderConfigurationModes';
import {
  OidcEndpointsConfigurationForm,
  type OidcEndpointsConfigurationFormProps,
} from './OidcEndpointsConfigurationForm';

const OIDC_ENDPOINT_MODES = ['discoveryUrl', 'manual'] as const satisfies readonly IdpConfigurationMode[];

export const OidcEndpointsStep = (): JSX.Element => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep, isLastStep } = useWizard();
  const {
    enterpriseConnection,
    enterpriseConnectionMutations: { updateConnection },
  } = useConfigureSSO();
  const oauthConfig = enterpriseConnection?.oauthConfig;
  const [mode, setMode] = React.useState<IdpConfigurationMode>('discoveryUrl');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const discoveryUrlField = useFormControl('discoveryUrl', oauthConfig?.discoveryUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.placeholder'),
    isRequired: true,
  });
  const authUrlField = useFormControl('authUrl', oauthConfig?.authUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.placeholder'),
    isRequired: true,
  });
  const tokenUrlField = useFormControl('tokenUrl', oauthConfig?.tokenUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.placeholder'),
    isRequired: true,
  });
  const userInfoUrlField = useFormControl('userInfoUrl', oauthConfig?.userInfoUrl ?? '', {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.placeholder'),
    isRequired: true,
  });

  const isValid =
    mode === 'discoveryUrl'
      ? discoveryUrlField.value.trim().length > 0
      : authUrlField.value.trim().length > 0 &&
        tokenUrlField.value.trim().length > 0 &&
        userInfoUrlField.value.trim().length > 0;

  const canSubmit = isValid && !isSubmitting;

  const formProps: OidcEndpointsConfigurationFormProps =
    mode === 'discoveryUrl'
      ? {
          mode: 'discoveryUrl',
          form: { discoveryUrlField },
          labels: {
            description: localizationKeys(
              'configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.description',
            ),
          },
        }
      : {
          mode: 'manual',
          form: { authUrlField, tokenUrlField, userInfoUrlField },
          labels: {
            description: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.description'),
          },
        };

  const handleContinue = async (): Promise<void> => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    card.setError(undefined);
    setIsSubmitting(true);

    try {
      await updateConnection(
        enterpriseConnection.id,
        mode === 'discoveryUrl'
          ? { oidc: { discoveryUrl: discoveryUrlField.value.trim() } }
          : {
              oidc: {
                authUrl: authUrlField.value.trim(),
                tokenUrl: tokenUrlField.value.trim(),
                userInfoUrl: userInfoUrlField.value.trim(),
              },
            },
      );
      void goNext();
    } catch (err) {
      handleError(
        err as Error,
        mode === 'discoveryUrl' ? [discoveryUrlField] : [authUrlField, tokenUrlField, userInfoUrlField],
        card.setError,
      );
      setIsSubmitting(false);
    }
  };

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
            onChange={setMode}
            labels={{
              ariaLabel: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.ariaLabel'),
              discoveryUrl: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.discoveryUrl'),
              manual: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.modes.manual'),
            }}
          />

          <OidcEndpointsConfigurationForm {...formProps} />
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Reset />
        <Step.Footer.Previous
          onClick={() => goPrev()}
          isDisabled={isFirstStep || isSubmitting}
        />
        <Step.Footer.Continue
          onClick={handleContinue}
          isLoading={isSubmitting}
          isDisabled={!canSubmit || isLastStep}
        />
      </Step.Footer>
    </>
  );
};
