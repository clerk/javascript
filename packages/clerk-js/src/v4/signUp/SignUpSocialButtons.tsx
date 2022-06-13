import { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { buildSSOCallbackURL } from '../../ui/common/redirects';
import { useCoreSignUp, useSignUpContext } from '../../ui/contexts';
import { useEnvironment } from '../../ui/contexts/EnvironmentContext';
import { SocialButtonsProps, SocialButtonsRoot } from '../elements/SocialButtons';

export const SignUpSocialButtons = React.memo((props: SocialButtonsProps) => {
  const { displayConfig } = useEnvironment();
  const ctx = useSignUpContext();
  const signUp = useCoreSignUp();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
  const redirectUrlComplete = ctx.afterSignUpUrl || displayConfig.afterSignUpUrl;

  return (
    <SocialButtonsRoot
      {...props}
      oauthCallback={(strategy: OAuthStrategy) =>
        signUp.authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
      }
    />
  );
});
