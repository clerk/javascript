import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { SESSION_STORAGE_AUTH_WITH_POPUP_KEY } from '../../../core/constants';
import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError, originPrefersPopup, web3CallbackErrorHandler } from '../../utils';

export const SignInSocialButtons = React.memo((props: SocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || '/';
  const shouldUsePopup = ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup());

  return (
    <SocialButtons
      {...props}
      idleAfterDelay={!shouldUsePopup}
      oauthCallback={strategy => {
        if (shouldUsePopup) {
          // We create the popup window here with the `about:blank` URL since some browsers will block popups that are
          // opened within async functions. The `signInWithPopup` method handles setting the URL of the popup.
          const popup = window.open('about:blank', '', 'width=600,height=800');
          // Unfortunately, there's no good way to detect when the popup is closed, so we simply poll and check if it's closed.
          const interval = setInterval(() => {
            if (!popup || popup.closed) {
              clearInterval(interval);
              card.setIdle();
            }
          }, 500);

          try {
            window.sessionStorage.setItem(SESSION_STORAGE_AUTH_WITH_POPUP_KEY, 'true');
          } catch {
            // It's okay if sessionStorage is disabled since we will treat the failure to read the value as it being true.
          }

          return signIn
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
