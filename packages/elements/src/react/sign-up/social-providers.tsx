'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';
import { useThirdPartyProvider } from '~/react/hooks';

import { SignUpStartCtx } from './start';

export interface SignUpSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}
// TODO: Consolidate with sign-in/social-providers.tsx
export function SignUpSocialProvider({ name, ...rest }: SignUpSocialProviderProps) {
  const ref = SignUpStartCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignUpSocialProviderIcon = SocialProviderIcon;
