import { withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import { withRedirectToAfterSignIn, withRedirectToSignInTask } from '../../common';
import { useCoreSignIn } from '../../contexts';
import { useIsWebAuthnSupported } from '../../hooks';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPasskeyCard } from './SignInFactorTwoPasskeyCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';
import { useSecondFactorSelection } from './useSecondFactorSelection';
import { isOfferableSecondFactor } from './utils';

function SignInClientTrustInternal(): JSX.Element {
  const signIn = useCoreSignIn();
  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
  } = useSecondFactorSelection(signIn.supportedSecondFactors);
  const webAuthnSupported = useIsWebAuthnSupported();
  const onShowAlternativeMethodsClicked =
    (signIn.supportedSecondFactors?.filter(f => isOfferableSecondFactor(f, webAuthnSupported)).length ?? 0) > 1
      ? toggleAllStrategies
      : undefined;

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
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'email_code':
      return (
        <SignInFactorTwoEmailCodeCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'email_link':
      return (
        <SignInFactorTwoEmailLinkCard
          showClientTrustNotice
          factorAlreadyPrepared={factorAlreadyPrepared}
          onFactorPrepare={handleFactorPrepare}
          factor={currentFactor}
          onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked}
        />
      );
    case 'passkey':
      return <SignInFactorTwoPasskeyCard onShowAlternativeMethodsClicked={onShowAlternativeMethodsClicked} />;
    default:
      return <LoadingCard />;
  }
}

export const SignInClientTrust = withRedirectToSignInTask(
  withRedirectToAfterSignIn(withCardStateProvider(SignInClientTrustInternal)),
);
