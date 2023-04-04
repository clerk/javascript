import type { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useNavigate } from '../../hooks';
import { handleError } from '../../utils';

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const clerk = useCoreClerk();
  const { navigate } = useNavigate();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || displayConfig.afterSignInUrl;

  return (
    <SocialButtons
      {...props}
      oauthCallback={(strategy: OAuthStrategy) => {
        return signIn
          .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={() => {
        return clerk
          .authenticateWithMetamask({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.signUpContinueUrl,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
    />
  );
});
