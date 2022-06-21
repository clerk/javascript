import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { Flow } from '../customizables';
import { VerificationCodeCard, VerificationCodeCardProps, withCardStateProvider } from '../elements';
import { useCardState } from '../elements/contexts';
import { handleError } from '../utils';

export function _SignInFactorTwo(): JSX.Element {
  const signIn = useCoreSignIn();
  const router = useRouter();

  React.useEffect(() => {
    // Handle the case where a user lands on alternative methods screen,
    // clicks a social button but then navigates back to signin.
    // SignIn status resets to 'needs_identifier'
    if (signIn.status === 'needs_identifier' || signIn.status === null) {
      void router.navigate('../');
    }
  }, []);

  return <SignInFactorTwoPhoneCodeCard />;
}

export const SignInFactorTwo = withRedirectToHome(withCardStateProvider(_SignInFactorTwo));

const SignInFactorTwoPhoneCodeCard = () => {
  const signIn = useCoreSignIn();
  const card = useCardState();
  const { applicationName } = useEnvironment().displayConfig;
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const defaultFactor = React.useMemo(() => {
    const secondFactors = signIn.supportedSecondFactors.filter(factor => factor.strategy === 'phone_code');
    const defaultIdentifier = secondFactors.find(factor => factor.default);
    return defaultIdentifier ? defaultIdentifier : secondFactors[0];
  }, []);

  React.useEffect(() => {
    // TODO: Make sure this id idempotent
    prepare();
  }, []);

  const prepare = () => {
    if (!signIn || signIn.secondFactorVerification.status === 'verified' || !defaultFactor) {
      return;
    }
    void signIn
      .prepareSecondFactor({ strategy: 'phone_code', phoneNumberId: defaultFactor.phoneNumberId })
      .catch(err => handleError(err, [], card.setError));
  };

  const action: VerificationCodeCardProps['onCodeEntryFinishedAction'] = (code, resolve, reject) => {
    return signIn
      .attemptSecondFactor({ strategy: 'phone_code', code })
      .then(async res => {
        await resolve();
        switch (res.status) {
          case 'complete':
            return setActive({ session: res.createdSessionId, beforeEmit: navigateAfterSignIn });
        }
      })
      .catch(err => reject(err));
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <VerificationCodeCard
        cardTitle='Sign in'
        cardSubtitle={`To continue to ${applicationName}`}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your phone number'
        onCodeEntryFinishedAction={action}
        onResendCodeClicked={prepare}
        safeIdentifier={defaultFactor.safeIdentifier}
        profileImageUrl={signIn.userData.profileImageUrl}
        onShowAlternativeMethodsClicked={undefined}
      />
    </Flow.Part>
  );
};
