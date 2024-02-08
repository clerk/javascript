'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';
import { useThirdPartyProvider } from '~/react/hooks';

import { SignInStartCtx } from './start';

export interface SignInSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

// TODO: Consolidate with sign-up/social-providers.tsx
export function SignInSocialProvider({ name, ...rest }: SignInSocialProviderProps) {
  const ref = SignInStartCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignInSocialProviderIcon = SocialProviderIcon;
