import { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { handleError } from '../../ui/common/errorHandler';
import { buildSSOCallbackURL } from '../../ui/common/redirects';
import { useCoreSignIn, useSignInContext } from '../../ui/contexts';
import { useEnvironment } from '../../ui/contexts/EnvironmentContext';
import { useCardState } from '../elements/contexts';
import { SocialButtonsProps, SocialButtonsRoot } from '../elements/SocialButtons';

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || displayConfig.afterSignInUrl;

  return (
    <SocialButtonsRoot
      {...props}
      oauthCallback={(strategy: OAuthStrategy) => {
        return signIn
          .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
          .catch(err => handleError(err, [], card.setError));
      }}
    />
  );
});
