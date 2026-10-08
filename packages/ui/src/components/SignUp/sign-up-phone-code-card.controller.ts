import { useCodePreparationController } from '@/ui/common/useCodePreparationController';
import { useCodeSubmissionController } from '@/ui/common/useCodeSubmissionController';
import { useCardState } from '@/ui/elements/contexts';

import type { SignUpPhoneCodeData, SignUpPhoneCodeViewProps } from './sign-up-code-verification.types';

export const useSignUpPhoneCodeCardController = (model: SignUpPhoneCodeData): SignUpPhoneCodeViewProps => {
  const card = useCardState();

  const preparation = useCodePreparationController(model);
  const action = useCodeSubmissionController(model);

  const prepareWithSMS = () => {
    if (!preparation.canRun()) {
      return;
    }
    const release = card.beginRequest();
    if (!release) {
      return;
    }
    card.setError(undefined);
    void preparation.runRequest(model.prepareSMSRequest).finally(release);
  };

  return {
    cardTitleKey: model.cardTitleKey,
    cardSubtitleKey: model.cardSubtitleKey,
    resendButtonKey: model.resendButtonKey,
    prepare: preparation.prepare,
    action,
    goBack: model.goBack,
    prepareWithSMS,
    phoneNumber: model.phoneNumber,
    isAlternativePhoneCodeProvider: model.isAlternativePhoneCodeProvider,
    isLoading: card.isLoading,
  };
};
