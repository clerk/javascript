import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || '/';

  return (
    <SocialButtons
      {...props}
      oauthCallback={strategy => {
        return signIn
          .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={strategy => {
        return clerk
          .authenticateWithMetamask({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.signUpContinueUrl,
            strategy,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
    />
  );
});
