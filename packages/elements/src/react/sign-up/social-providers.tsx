'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider } from '~/react/common/third-party-providers/social-provider';
import { useThirdPartyProvider } from '~/react/hooks';
import { SignUpRouterCtx } from '~/react/sign-up/context';

export interface SignUpSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

// TODO: Consolidate with sign-in/social-providers.tsx

/**
 * Renders a social provider button for the given `name`. Renders a button that will trigger a sign-up attempt. If your instance does not have the social provider enabled an error will be thrown.
 *
 * @param {string} name - Name of the provider to render
 */
export function SignUpSocialProvider({ name, ...rest }: SignUpSocialProviderProps) {
  const ref = SignUpRouterCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}
