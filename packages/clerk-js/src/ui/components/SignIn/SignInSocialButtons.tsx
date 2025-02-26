import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { buildPopupCallbackURL, buildSSOCallbackURL } from '../../common/redirects';
import { useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError, web3CallbackErrorHandler } from '../../utils';

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const popupCallbackUrl = buildPopupCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || '/';

  return (
    <SocialButtons
      {...props}
      oauthCallback={strategy => {
        const popup = window.open('about:blank', '', 'width=600,height=600');
        return clerk
          .authenticateWithPopup({ strategy, redirectUrl, redirectUrlComplete, popupCallbackUrl, popup })
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
