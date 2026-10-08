import type { PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';

import { useSocialAuthenticationController } from '@/ui/common/useSocialAuthenticationController';

import { SocialButtons, type SocialButtonsProps } from '../../elements/SocialButtons';
import { useSignInSocialButtonsModel } from './sign-in-social-buttons.model';

export type SignInSocialButtonsProps = SocialButtonsProps & {
  onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};

export const SignInSocialButtons = React.memo((props: SignInSocialButtonsProps) => {
  const model = useSignInSocialButtonsModel();
  const controller = useSocialAuthenticationController(model, props.onAlternativePhoneCodeProviderClick);
  return (
    <SocialButtons
      enableOAuthProviders={props.enableOAuthProviders}
      enableWeb3Providers={props.enableWeb3Providers}
      enableAlternativePhoneCodeProviders={props.enableAlternativePhoneCodeProviders}
      showLastAuthenticationStrategy
      {...controller}
    />
  );
});
