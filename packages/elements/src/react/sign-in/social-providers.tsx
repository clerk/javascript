'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import { useSignInThirdPartyProvider } from '~/internals/machines/sign-in/sign-in.context';
import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';

export interface SignInSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

export function SignInSocialProvider({ name, ...rest }: SignInSocialProviderProps) {
  const thirdPartyProvider = useSignInThirdPartyProvider(name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignInSocialProviderIcon = SocialProviderIcon;
