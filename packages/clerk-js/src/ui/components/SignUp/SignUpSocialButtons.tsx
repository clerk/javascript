import type { OAuthStrategy } from '@clerk/types';
import React from 'react';

import { buildSSOCallbackURL } from '../../common/redirects';
import { useCoreClerk, useCoreSignUp, useSignUpContext } from '../../contexts';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { useCardState } from '../../elements';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
import { SocialButtons } from '../../elements/SocialButtons';
import { useRouter } from '../../router';
import { handleError } from '../../utils';

export type SignUpSocialButtonsProps = SocialButtonsProps & { continueSignUp?: boolean };

export const SignUpSocialButtons = React.memo((props: SignUpSocialButtonsProps) => {
  const clerk = useCoreClerk();
  const { navigate } = useRouter();
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const ctx = useSignUpContext();
  const signUp = useCoreSignUp();
  const redirectUrl = buildSSOCallbackURL(ctx, displayConfig.signUpUrl);
  const redirectUrlComplete = ctx.afterSignUpUrl || displayConfig.afterSignUpUrl;
  const { continueSignUp = false, ...rest } = props;

  return (
    <SocialButtons
      {...rest}
      oauthCallback={(strategy: OAuthStrategy) => {
        return signUp
          .authenticateWithRedirect({
            continueSignUp,
            redirectUrl,
            redirectUrlComplete,
            strategy,
            unsafeMetadata: ctx.unsafeMetadata,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
      web3Callback={() => {
        return clerk
          .authenticateWithMetamask({
            customNavigate: navigate,
            redirectUrl: redirectUrlComplete,
            signUpContinueUrl: 'continue',
            unsafeMetadata: ctx.unsafeMetadata,
          })
          .catch(err => handleError(err, [], card.setError));
      }}
    />
  );
});
