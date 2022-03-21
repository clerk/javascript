import { SignInFactor } from '@clerk/types';
import React from 'react';
import { LoadingScreen, shouldDisableStrategy, withRedirectToHome } from 'ui/common';
import { useCoreSignIn, useEnvironment, useSignInContext } from 'ui/contexts';
import { AllFirstFactorStrategies, SignInFactorOneInputBased, SignInFactorOneMagicLink } from 'ui/signIn/factorOne';

import { ErrorScreen } from './strategies';
import { determineStartingSignInFactor } from './utils';

function _SignInFactorOne(): JSX.Element {
  const signInContext = useSignInContext();
  const signIn = useCoreSignIn();
  const { displayConfig } = useEnvironment();
  const { preferredSignInStrategy } = displayConfig;
  const availableFactors = signIn.supportedFirstFactors.filter(f => !shouldDisableStrategy(signInContext, f.strategy));
  const [lastUsedFactor, setLastUsedFactor] = React.useState<SignInFactor | null>(null);
  const [currentFactor, setCurrentFactor] = React.useState<SignInFactor | undefined | null>(() => {
    return determineStartingSignInFactor(availableFactors, signIn.identifier, preferredSignInStrategy);
  });
  const [showAllStrategies, setShowAllStrategies] = React.useState<boolean>(!currentFactor);

  const handleAlternativeFactorSelect = (selectedFactor: SignInFactor) => {
    setCurrentFactor(selectedFactor);
    setShowAllStrategies(false);
  };

  const handleBackButtonClicked = () => {
    if (showAllStrategies) {
      setShowAllStrategies(false);
    }
  };

  if (!currentFactor && signIn.status) {
    return <ErrorScreen message="Cannot proceed with sign in. There's no available authentication method." />;
  }

  if (!currentFactor) {
    return <LoadingScreen />;
  }

  if (showAllStrategies) {
    return (
      <AllFirstFactorStrategies
        factors={availableFactors}
        handleBack={handleBackButtonClicked}
        handleSelect={handleAlternativeFactorSelect}
      />
    );
  }

  const disableEmailLink = shouldDisableStrategy(signInContext, emailLinkStrategy);
  return (
    <>
      {currentFactor.strategy === emailLinkStrategy && !disableEmailLink && (
        <SignInFactorOneMagicLink
          handleShowAllStrategies={() => setShowAllStrategies(true)}
          currentFactor={currentFactor}
        />
      )}
      {(currentFactor.strategy === 'email_code' ||
        currentFactor.strategy === 'phone_code' ||
        currentFactor.strategy === 'password') && (
        <SignInFactorOneInputBased
          handleShowAllStrategies={() => setShowAllStrategies(true)}
          currentFactor={currentFactor}
          lastUsedFactor={lastUsedFactor}
          setLastUsedFactor={setLastUsedFactor}
        />
      )}
    </>
  );
}

const emailLinkStrategy = 'email_link';

export const SignInFactorOne = withRedirectToHome(_SignInFactorOne);
