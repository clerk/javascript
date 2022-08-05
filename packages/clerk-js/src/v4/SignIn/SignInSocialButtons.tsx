import React from 'react';

import { buildSSOCallbackURL } from '../../ui/common/redirects';
import { useCoreClerk, useCoreSignIn, useSignInContext } from '../../ui/contexts';
import { useEnvironment } from '../../ui/contexts/EnvironmentContext';
import { useNavigate } from '../../ui/hooks';
import { useCardState } from '../elements/contexts';
import { SocialButtons, SocialButtonsProps } from '../elements/SocialButtons';
import { handleError } from '../utils';

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
      oauthCallback={strategy => {
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
