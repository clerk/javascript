'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';
import { useThirdPartyProvider } from '~/react/sign-in/hooks/use-third-party-provider.hook';

export interface SignInSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

export function SignInSocialProvider({ name, ...rest }: SignInSocialProviderProps) {
  const thirdPartyProvider = useThirdPartyProvider(name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignInSocialProviderIcon = SocialProviderIcon;
