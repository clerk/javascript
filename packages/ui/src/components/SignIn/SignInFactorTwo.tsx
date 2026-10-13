import { useClerk } from '@clerk/shared/react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useRouter } from '../../router';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoBackupCodeCard } from './SignInFactorTwoBackupCodeCard';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { SignInFactorTwoTOTPCard } from './SignInFactorTwoTOTPCard';
import { useSecondFactorSelection } from './useSecondFactorSelection';
import { useSignInStepGuard } from './useSignInStepGuard';

function SignInFactorTwoInternal(): JSX.Element {
  const clerk = useClerk();
  const signIn = useCoreSignIn();
  const router = useRouter();
  const { afterSignInUrl } = useSignInContext();
  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection(signIn.supportedSecondFactors);
  const onShowAlternativeMethodsClicked =
    signIn.supportedSecondFactors && signIn.supportedSecondFactors.length > 1 ? toggleAllStrategies : undefined;

  const leaveFactorTwo = () => {
    // If the user is already signed in (e.g. multi-session app, page reload after
    // successful verification), redirect forward to afterSignInUrl instead of
    // back to sign-in start.
    if (clerk.isSignedIn) {
      void router.navigate(afterSignInUrl);
    } else {
      void router.navigate('../');
    }
  };

  // Leave if the sign-in no longer needs second-factor verification.
  useSignInStepGuard({
    redirectStatuses: ['needs_identifier', 'needs_first_factor'],
    onLeave: leaveFactorTwo,
  });

  if (!currentFactor) {
    return <LoadingCard />;
  }

  if (showAllStrategies) {
    return (
      <SignInFactorTwoAlternativeMethods
        onBackLinkClick={toggleAllStrategies}
        onFactorSelected={selectFactor}
      />
    );
  }

  switch (currentFactor?.strategy) {
    case 'phone_code':
      return (
        <SignInFactorTwoPhoneCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'totp':
      return (
        <SignInFactorTwoTOTPCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'backup_code':
      return <SignInFactorTwoBackupCodeCard onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked} />;
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'email_link':
      return (
        <SignInFactorTwoEmailLinkCard
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    default:
      return <LoadingCard />;
  }
}

export const SignInFactorTwo = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInFactorTwoInternal)),
);
