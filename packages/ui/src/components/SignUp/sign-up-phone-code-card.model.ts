import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';

import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignUp } from '../../contexts';
import { localizationKeys } from '../../customizables';
import type { SignUpPhoneCodeData } from './sign-up-code-verification.types';
import { useSignUpVerificationCodeFormModel } from './sign-up-verification-code-form.model';

export const useSignUpPhoneCodeCardModel = (): SignUpPhoneCodeData => {
  const signUp = useCoreSignUp();
  const { goBack, complete } = useSignUpVerificationCodeFormModel();
  const channel = signUp.verifications.phoneNumber.channel;
  const readTarget = () => JSON.stringify(['phone_code', signUp.phoneNumber, signUp.verifications.phoneNumber.channel]);
  const scope = useAuthCodeRequestScopeModel('signUp', signUp, readTarget(), readTarget);

  const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
  const hasPendingPhoneCodeVerification =
    phoneVerificationStatus === 'unverified' && signUp.verifications.phoneNumber.strategy === 'phone_code';
  const shouldAvoidPrepare = !signUp.status || phoneVerificationStatus === 'verified';
  const isAlternativePhoneCodeProvider = !!channel && channel !== 'sms';

  // If the channel is 'sms', we don't want to send the channel parameter
  const channelToBeSent = isAlternativePhoneCodeProvider ? channel : undefined;

  const shouldAvoidInitialPrepare =
    shouldAvoidPrepare || hasPendingPhoneCodeVerification || isAlternativePhoneCodeProvider;

  let cardTitleKey = localizationKeys('signUp.phoneCode.title');
  let cardSubtitleKey = localizationKeys('signUp.phoneCode.subtitle');
  let resendButtonKey = localizationKeys('signUp.phoneCode.resendButton');

  if (isAlternativePhoneCodeProvider) {
    const provider = getAlternativePhoneCodeProviderData(channel)?.name;
    cardTitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.title', { provider: provider || '' });
    cardSubtitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.subtitle', {
      provider: provider || '',
    });
    resendButtonKey = localizationKeys('signUp.alternativePhoneCodeProvider.resendButton');
  }

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    cardTitleKey,
    cardSubtitleKey,
    resendButtonKey,
    shouldAvoidPrepare,
    shouldAvoidInitialPrepare,
    prepareRequest: async () => {
      await scope.run(() =>
        signUp.preparePhoneNumberVerification({ strategy: 'phone_code', channel: channelToBeSent }),
      );
    },
    prepareSMSRequest: async () => {
      await scope.run(() => signUp.preparePhoneNumberVerification({ strategy: 'phone_code', channel: undefined }));
    },
    attempt: async code => {
      const resource = await scope.run(() => signUp.attemptPhoneNumberVerification({ code }));
      return async () => {
        if (resource) {
          await scope.run(async () => {
            await complete(resource);
          });
        }
      };
    },
    goBack,
    phoneNumber: signUp.phoneNumber,
    isAlternativePhoneCodeProvider,
  };
};
