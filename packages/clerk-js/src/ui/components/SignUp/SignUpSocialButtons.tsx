import { useClerk } from '@clerk/shared/react';
import type { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { useCardState } from '../../elements';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

export type SignUpSocialButtonsProps = Omit<SocialButtonsProps, 'signUpContinueUrl' | 'redirectUrlComplete'> & {
  continueSignUp?: boolean;
  legalAccepted?: boolean;
};

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
      signUpContinueUrl={'continue'}
      redirectUrlComplete={redirectUrlComplete}
      oauthCallback={(strategy: OAuthStrategy) => {
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
      web3Callback={strategy =>
        clerk.authenticateWithWeb3({
          customNavigate: navigate,
          redirectUrl: redirectUrlComplete,
          signUpContinueUrl: 'continue',
          unsafeMetadata: ctx.unsafeMetadata,
          strategy,
          legalAccepted: props.legalAccepted,
          __experimental_throwOnCoinbaseSDKBlocked: true,
        })
      }
    />
  );
});
