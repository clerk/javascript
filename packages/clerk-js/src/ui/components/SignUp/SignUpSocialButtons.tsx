import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { useCardState } from '../../elements';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError, web3CallbackErrorHandler } from '../../utils';

const POPUP_PREFERRED_ORIGINS = ['.lovable.app', 'localhost:4000'];
function originPrefersPopup(): boolean {
  return POPUP_PREFERRED_ORIGINS.some(origin => window.location.origin.endsWith(origin));
}

export type SignUpSocialButtonsProps = SocialButtonsProps & { continueSignUp?: boolean; legalAccepted?: boolean };

export const SignUpSocialButtons = React.memo((props: SignUpSocialButtonsProps) => {
  const clerk = useClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const ctx = useSignUpContext();
  const signUp = useCoreSignUp();
  const redirectUrl = ctx.ssoCallbackUrl;
  const redirectUrlComplete = ctx.afterSignUpUrl || '/';
  const { continueSignUp = false, ...rest } = props;

  return (
    <SocialButtons
      {...rest}
      oauthCallback={(strategy: OAuthStrategy) => {
        if (ctx.oauthFlow === 'popup' || (ctx.oauthFlow === 'auto' && originPrefersPopup())) {
          const popup = window.open('about:blank', '', 'width=600,height=800');
          return clerk
            .signUpWithPopup({
              strategy,
              redirectUrl,
              redirectUrlComplete,
              popup,
              continueSignUp,
              unsafeMetadata: ctx.unsafeMetadata,
              legalAccepted: props.legalAccepted,
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
    />
  );
});
