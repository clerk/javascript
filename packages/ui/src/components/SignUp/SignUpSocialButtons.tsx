import type { PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';

import { useSocialAuthenticationController } from '@/ui/common/useSocialAuthenticationController';

import { SocialButtons, type SocialButtonsProps } from '../../elements/SocialButtons';
import { useSignUpSocialButtonsModel } from './sign-up-social-buttons.model';

export type SignUpSocialButtonsProps = SocialButtonsProps & {
  continueSignUp?: boolean;
  legalAccepted?: boolean;
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};

export const SignUpSocialButtons = React.memo((props: SignUpSocialButtonsProps) => {
  const model = useSignUpSocialButtonsModel(props);
  const controller = useSocialAuthenticationController(model, props.onAlternativePhoneCodeProviderClick);
  return (
    <SocialButtons
      enableOAuthProviders={props.enableOAuthProviders}
      enableWeb3Providers={props.enableWeb3Providers}
      enableAlternativePhoneCodeProviders={props.enableAlternativePhoneCodeProviders}
      showLastAuthenticationStrategy={false}
      {...controller}
    />
  );
});
