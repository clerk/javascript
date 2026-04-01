import type { ClerkAPIError } from '@clerk/shared/error';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { ERROR_CODES } from '@clerk/shared/internal/clerk-js/constants';
import { useClerk } from '@clerk/shared/react';
import type { PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';

import { handleError as _handleError } from '@/ui/utils/errorHandler';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements/contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';

export type SignInSocialButtonsProps = SocialButtonsProps & {
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};

export const SignInSocialButtons = React.memo((props: SignInSocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signInUrl);
  const redirectUrlComplete = ctx.afterSignInUrl || '/';
  const shouldUsePopup = ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup());
  const { onAlternativePhoneCodeProviderClick, ...rest } = props;

  const handleError = (err: any) => {
    if (isClerkAPIResponseError(err)) {
      const sessionAlreadyExistsError: ClerkAPIError | undefined = err.errors.find(
        (e: ClerkAPIError) => e.code === ERROR_CODES.SESSION_EXISTS,
      );

      if (sessionAlreadyExistsError) {
        return clerk.setActive({
          session: clerk.client.lastActiveSessionId,
          navigate: async ({ session, decorateUrl }) => {
            await ctx.navigateOnSetActive({ session, redirectUrl: ctx.afterSignInUrl, decorateUrl });
          },
        });
      }
    }

    return _handleError(err, [], card.setError);
  };

  return (
    <SocialButtons
      {...rest}
      showLastAuthenticationStrategy
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

          return signIn
            .authenticateWithPopup({ strategy, redirectUrl, redirectUrlComplete, popup, oidcPrompt: ctx.oidcPrompt })
            .catch(err => handleError(err));
        }

        return signIn
          .authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete, oidcPrompt: ctx.oidcPrompt })
          .catch(err => handleError(err));
      }}
      web3Callback={strategy => {
        if (strategy === 'web3_solana_signature') {
          return navigate(`choose-wallet?strategy=${strategy}`);
        }

        return clerk
          .authenticateWithWeb3({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: ctx.isCombinedFlow ? 'create/continue' : ctx.signUpContinueUrl,
            strategy,
            secondFactorUrl: 'factor-two',
          })
          .catch(err => web3CallbackErrorHandler(err, card.setError));
      }}
      alternativePhoneCodeCallback={channel => {
        onAlternativePhoneCodeProviderClick?.(channel);
      }}
    />
  );
});
