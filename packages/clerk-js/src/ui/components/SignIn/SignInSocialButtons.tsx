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

export const SignInSocialButtons = React.memo(
  (props: Omit<SocialButtonsProps, 'signUpContinueUrl' | 'redirectUrlComplete'>) => {
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
        signUpContinueUrl={ctx.signUpContinueUrl}
        redirectUrlComplete={redirectUrlComplete}
        oauthCallback={strategy => {
          return signIn
            .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
            .catch(err => handleError(err, [], card.setError));
        }}
        web3Callback={strategy =>
          clerk.authenticateWithWeb3({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.signUpContinueUrl,
            strategy,
            __experimental_throwOnCoinbaseSDKBlocked: true,
          })
        }
      />
    );
  },
);
