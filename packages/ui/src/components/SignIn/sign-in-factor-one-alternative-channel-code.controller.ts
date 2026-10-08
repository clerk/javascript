import { useCardState } from '@/ui/elements/contexts';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { handleError } from '@/ui/utils/errorHandler';

import type { useSignInFactorOneAlternativeChannelCodeModel } from './sign-in-factor-one-alternative-channel-code.model';

type SignInFactorOneAlternativeChannelCodeModel = ReturnType<typeof useSignInFactorOneAlternativeChannelCodeModel>;

export function useSignInFactorOneAlternativeChannelCodeController(model: SignInFactorOneAlternativeChannelCodeModel) {
  const card = useCardState();

  const prepare = () => {
    void model.prepare().catch(error => handleError(error, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    void model.attempt(code, resolve).catch(reject);
  };

  // This is used on clicking "Send code via SMS instead"
  const prepareWithSMS = () => {
    card.setError(undefined);
    model.changeToSMS();
  };

  return {
    safeIdentifier: model.safeIdentifier,
    profileImageUrl: model.profileImageUrl,
    goBack: model.goBack,
    prepare,
    action,
    prepareWithSMS,
  };
}
