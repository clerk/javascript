import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError, web3CallbackErrorHandler } from '../../utils';

const POPUP_PREFERRED_ORIGINS = ['.lovable.app'];
function originPrefersPopup(): boolean {
  return POPUP_PREFERRED_ORIGINS.some(origin => window.location.origin.endsWith(origin));
}

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
        if (ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup())) {
          const popup = window.open('about:blank', '', 'width=600,height=800');
          return clerk
            .authenticateWithPopup({ strategy, redirectUrl, redirectUrlComplete, popup })
            .catch(err => handleError(err, [], card.setError));
        }

        return signIn
          .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={strategy => {
        return clerk
          .authenticateWithWeb3({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.isCombinedFlow ? 'create/continue' : ctx.signUpContinueUrl,
            strategy,
          })
          .catch(err => web3CallbackErrorHandler(err, card.setError));
      }}
    />
  );
});
