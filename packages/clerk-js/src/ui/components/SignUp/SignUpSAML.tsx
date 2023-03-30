import React from 'react';

import { buildSSOCallbackURL } from '../../common';
import { useCoreSignUp, useEnvironment, useSignUpContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { SAMLCard } from '../Shared/SAMLCard';

function _SignUpSAML() {
  const strategy = 'saml';
  const signUp = useCoreSignUp();
  const ctx = useSignUpContext();
  const { displayConfig } = useEnvironment();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
  const redirectUrlComplete = ctx.afterSignUpUrl || displayConfig.afterSignUpUrl;

  // TODO handle continueSignUp
  const handleEmailAddress = (emailAddress: string) => {
    return signUp.authenticateWithSAML({
      strategy,
      identifier: emailAddress,
      redirectUrl,
      redirectUrlComplete,
      continueSignUp: false,
    });
  };

  return (
    <SAMLCard
      cardTitle={localizationKeys('signUp.saml.title')}
      cardSubtitle={localizationKeys('signUp.saml.subtitle')}
      handleEmailAddress={handleEmailAddress}
    />
  );
}

export const SignUpSAML = withCardStateProvider(_SignUpSAML);
