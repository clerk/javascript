import { LoadingCard } from '@/ui/elements/LoadingCard';

import type { useSignInClientTrustController } from './sign-in-client-trust.controller';
import { SignInFactorTwoAlternativeMethods } from './SignInFactorTwoAlternativeMethods';
import { SignInFactorTwoEmailCodeCard } from './SignInFactorTwoEmailCodeCard';
import { SignInFactorTwoEmailLinkCard } from './SignInFactorTwoEmailLinkCard';
import { SignInFactorTwoPhoneCodeCard } from './SignInFactorTwoPhoneCodeCard';

export type SignInClientTrustViewProps = ReturnType<typeof useSignInClientTrustController>;

export function SignInClientTrustView(props: SignInClientTrustViewProps): JSX.Element {
  const {
    currentFactor,
    factorAlreadyPrepared,
    handleFactorPrepare,
    selectFactor,
    showAllStrategies,
    toggleAllStrategies,
    onShowAlternativeMethodsClicked,
  } = props;

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
    default:
      return <LoadingCard />;
  }
}
