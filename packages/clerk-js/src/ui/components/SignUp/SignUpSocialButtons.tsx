import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy, PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { originPrefersPopup } from '@/ui/utils/originPrefersPopup';
import { web3CallbackErrorHandler } from '@/ui/utils/web3CallbackErrorHandler';

import { useCoreSignUp, useSignUpContext } from '../../contexts';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';

export type SignUpSocialButtonsProps = SocialButtonsProps & {
  continueSignUp?: boolean;
  legalAccepted?: boolean;
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};

export const SignUpSocialButtons = React.memo((props: SignUpSocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const ctx = useSignUpContext();
  const signUp = useCoreSignUp();
  const redirectUrl = ctx.ssoCallbackUrl;
  const redirectUrlComplete = ctx.afterSignUpUrl || '/';
  const shouldUsePopup = ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup());
  const { continueSignUp = false, onAlternativePhoneCodeProviderClick, ...rest } = props;

  return (
    <SocialButtons
      {...rest}
      showLastAuthenticationStrategy={false}
      idleAfterDelay={!shouldUsePopup}
      oauthCallback={(strategy: OAuthStrategy) => {
        if (shouldUsePopup) {
          // We create the popup window here with the `about:blank` URL since some browsers will block popups that are
          // opened within async functions. The `signUpWithPopup` method handles setting the URL of the popup.
          const popup = window.open('about:blank', '', 'width=600,height=800');
          // Unfortunately, there's no good way to detect when the popup is closed, so we simply poll and check if it's closed.
          const interval = setInterval(() => {
            if (!popup || popup.closed) {
              clearInterval(interval);
              card.setIdle();
            }
          }, 500);

          return signUp
            .authenticateWithPopup({
              strategy,
              redirectUrl,
              redirectUrlComplete,
              popup,
              continueSignUp,
              unsafeMetadata: ctx.unsafeMetadata,
              legalAccepted: props.legalAccepted,
              oidcPrompt: ctx.oidcPrompt,
            })
            .catch(err => handleError(err, [], card.setError));
        }

        return signUp
          .authenticateWithRedirect({
            continueSignUp,
            redirectUrl,
            redirectUrlComplete,
            strategy,
            unsafeMetadata: ctx.unsafeMetadata,
            legalAccepted: props.legalAccepted,
            oidcPrompt: ctx.oidcPrompt,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={strategy => {
        return clerk
          .authenticateWithWeb3({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: 'continue',
            unsafeMetadata: ctx.unsafeMetadata,
            strategy,
            legalAccepted: props.legalAccepted,
          })
          .catch(err => web3CallbackErrorHandler(err, card.setError));
      }}
      alternativePhoneCodeCallback={channel => {
        onAlternativePhoneCodeProviderClick?.(channel);
      }}
    />
  );
});
