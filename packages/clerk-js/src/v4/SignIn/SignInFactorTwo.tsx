import { SignInFactor } from '@clerk/types';
import React from 'react';

import { withRedirectToHome } from '../../ui/common/withRedirectToHome';
import { useCoreSignIn } from '../../ui/contexts';
import { useRouter } from '../../ui/router';
import { determineStartingSignInSecondFactor } from '../../ui/signIn/utils';
import { LoadingCard, withCardStateProvider } from '../elements';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { SignInFactorTwoTOTPCard } from './SignInFactorTwoTOTPCard';

const factorKey = (factor: SignInFactor | null | undefined) => {
  if (!factor) {
    return '';
  }
  let key = factor.strategy;
  if ('phoneNumberId' in factor) {
    key += factor.phoneNumberId;
  }
  return key;
};

export function _SignInFactorTwo(): JSX.Element {
  const signIn = useCoreSignIn();
  const availableFactors = signIn.supportedSecondFactors;
  const router = useRouter();

  const lastPreparedFactorKeyRef = React.useRef('');
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | null>(() =>
    determineStartingSignInSecondFactor(availableFactors),
  );

  // TODO
  const handleFactorPrepare = () => {
    lastPreparedFactorKeyRef.current = factorKey(currentFactor);
  };

  React.useEffect(() => {
    // Handle the case where a user lands on alternative methods screen,
    // clicks a social button but then navigates back to signin.
    // SignIn status resets to 'needs_identifier'
    if (signIn.status === 'needs_identifier' || signIn.status === null) {
      void router.navigate('../');
    }
  }, []);

  if (!currentFactor) {
    return <LoadingCard />;
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={undefined}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={lastPreparedFactorKeyRef.current === factorKey(currentFactor)}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={undefined}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorTwo = withRedirectToHome(withCardStateProvider(_SignInFactorTwo));
