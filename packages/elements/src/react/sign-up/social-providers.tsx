'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import { useThirdPartyProvider } from '~/react/hooks/use-third-party-provider.hook';

import type { SocialProviderProps } from '../common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '../common/third-party-providers/social-provider';
import { SignUpCtx } from './contexts/sign-up.context';

export interface SignUpSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

export function SignUpSocialProvider({ name, ...rest }: SignUpSocialProviderProps) {
  const ref = SignUpCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

export const SignUpSocialProviderIcon = SocialProviderIcon;
