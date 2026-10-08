import { useAuthCodeRequestScopeModel } from '@/ui/common/auth-code-request-scope.model';

import { useCoreSignUp } from '../../contexts';
import type { SignUpEmailCodeData } from './sign-up-code-verification.types';
import { useSignUpVerificationCodeFormModel } from './sign-up-verification-code-form.model';

export const useSignUpEmailCodeCardModel = (): SignUpEmailCodeData => {
  const signUp = useCoreSignUp();
  const { goBack, complete } = useSignUpVerificationCodeFormModel();
  const readTarget = () => JSON.stringify(['email_code', signUp.emailAddress]);
  const scope = useAuthCodeRequestScopeModel('signUp', signUp, readTarget(), readTarget);

  const emailVerificationStatus = signUp.verifications.emailAddress.status;
  const hasPendingEmailCodeVerification =
    emailVerificationStatus === 'unverified' && signUp.verifications.emailAddress.strategy === 'email_code';
  const shouldAvoidPrepare = !signUp.status || emailVerificationStatus === 'verified';
  const shouldAvoidInitialPrepare = shouldAvoidPrepare || hasPendingEmailCodeVerification;

  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    shouldAvoidPrepare,
    shouldAvoidInitialPrepare,
    prepareRequest: async () => {
      await scope.run(() => signUp.prepareEmailAddressVerification({ strategy: 'email_code' }));
    },
    attempt: async code => {
      const resource = await scope.run(() => signUp.attemptEmailAddressVerification({ code }));
      return async () => {
        if (resource) {
          await scope.run(async () => {
            await complete(resource);
          });
        }
      };
    },
    goBack,
    emailAddress: signUp.emailAddress,
  };
};
