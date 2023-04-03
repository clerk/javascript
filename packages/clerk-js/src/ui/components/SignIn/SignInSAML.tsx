import React from 'react';

import { buildSSOCallbackURL } from '../../common';
import { useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { SAMLCard } from '../Shared/SAMLCard';

function _SignInSAML() {
  const strategy = 'saml';
  const signIn = useCoreSignIn();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || displayConfig.afterSignInUrl;

  const handleEmailAddress = (emailAddress: string) => {
    return signIn.authenticateWithSAML({ strategy, emailAddress, redirectUrl, redirectUrlComplete });
  };

  return (
    <SAMLCard
      cardTitle={localizationKeys('signIn.saml.title')}
      cardSubtitle={localizationKeys('signIn.saml.subtitle')}
      handleEmailAddress={handleEmailAddress}
    />
  );
}

export const SignInSAML = withCardStateProvider(_SignInSAML);
