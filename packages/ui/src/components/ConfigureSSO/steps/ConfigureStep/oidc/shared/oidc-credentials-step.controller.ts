import { useReducer } from 'react';

import { localizationKeys } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useWizard } from '../../../../elements/Wizard';
import type { OidcIdpConfigurationMode } from '../../shared/IdentityProviderConfigurationModes';
import type { useOidcCredentialsStepModel } from './oidc-credentials-step.model';

type Model = ReturnType<typeof useOidcCredentialsStepModel>;
type SubmissionState = 'idle' | 'submitting';
type SubmissionEvent = 'submit' | 'fail';
const reduceSubmission = (_state: SubmissionState, event: SubmissionEvent): SubmissionState =>
  event === 'submit' ? 'submitting' : 'idle';

export const useOidcCredentialsStepController = (mode: OidcIdpConfigurationMode, model: Model) => {
  const card = useCardState();
  const { goNext, goPrev, isFirstStep } = useWizard();
  const clientIdField = useFormControl('clientId', model.initialClientId, {
    type: 'text',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.placeholder'),
    isRequired: true,
  });
  const clientSecretField = useFormControl('clientSecret', '', {
    type: 'password',
    label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.label'),
    placeholder: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientSecret.placeholder'),
    isRequired: true,
  });
  const [state, dispatch] = useReducer(reduceSubmission, 'idle');
  const isSubmitting = state === 'submitting';
  const canSubmit = clientIdField.value.trim().length > 0 && clientSecretField.value.trim().length > 0 && !isSubmitting;

  const handleContinue = async (): Promise<void> => {
    if (!model.hasConnection || !canSubmit) {
      return;
    }
    card.setError(undefined);
    dispatch('submit');
    try {
      await model.submitCredentials(clientIdField.value.trim(), clientSecretField.value.trim(), mode);
      void goNext();
    } catch (err) {
      handleError(err as Error, [clientIdField, clientSecretField], card.setError);
      dispatch('fail');
    }
  };

  return { clientIdField, clientSecretField, isSubmitting, canSubmit, goPrev, isFirstStep, handleContinue };
};
