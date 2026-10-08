import { useReducer } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useWizard } from '../../../../elements/Wizard';
import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';
import type { useOidcEndpointsStepModel } from './oidc-endpoints-step.model';
import type { OidcEndpointsConfigurationFormProps } from './OidcEndpointsConfigurationForm';

type Model = ReturnType<typeof useOidcEndpointsStepModel>;
type SubmissionState = 'idle' | 'submitting';
type SubmissionEvent = 'submit' | 'fail';
const reduceSubmission = (_state: SubmissionState, event: SubmissionEvent): SubmissionState =>
  event === 'submit' ? 'submitting' : 'idle';

export const useOidcEndpointsStepController = (
  mode: OidcIdpConfigurationMode,
  onModeChange: (mode: OidcIdpConfigurationMode) => void,
  model: Model,
) => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const [state, dispatch] = useReducer(reduceSubmission, 'idle');
  const isSubmitting = state === 'submitting';

  const discoveryUrlField = useFormControl('discoveryUrl', model.initialValues.discoveryUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.placeholder'),
    isRequired: true,
  });
  const authUrlField = useFormControl('authUrl', model.initialValues.authUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.placeholder'),
    isRequired: true,
  });
  const tokenUrlField = useFormControl('tokenUrl', model.initialValues.tokenUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.placeholder'),
    isRequired: true,
  });
  const userInfoUrlField = useFormControl('userInfoUrl', model.initialValues.userInfoUrl, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.placeholder'),
  });

  const isValid =
    mode === 'discoveryUrl'
      ? discoveryUrlField.value.trim().length > 0
      : authUrlField.value.trim().length > 0 && tokenUrlField.value.trim().length > 0;
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

  const handleModeChange = (nextMode: OidcIdpConfigurationMode) => {
    card.setError(undefined);
    onModeChange(nextMode);
  };

  const handleContinue = async (): Promise<void> => {
    if (!model.hasConnection || !canSubmit) {
      return;
    }
    card.setError(undefined);
    dispatch('submit');
    try {
      await model.submitEndpoints(mode, {
        discoveryUrl: discoveryUrlField.value.trim(),
        authUrl: authUrlField.value.trim(),
        tokenUrl: tokenUrlField.value.trim(),
        userInfoUrl: userInfoUrlField.value.trim(),
      });
      void goNext();
    } catch (err) {
      handleError(
        err as Error,
        mode === 'discoveryUrl' ? [discoveryUrlField] : [authUrlField, tokenUrlField, userInfoUrlField],
        card.setError,
      );
      dispatch('fail');
    }
  };

  return { mode, formProps, isSubmitting, canSubmit, goPrev, isFirstStep, handleModeChange, handleContinue };
};
