'use client';

import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { SocialProviderProps } from '~/react/common/third-party-providers/social-provider';
import { SocialProvider, SocialProviderIcon } from '~/react/common/third-party-providers/social-provider';
import { useThirdPartyProvider } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export interface SignInSocialProviderProps extends Omit<SocialProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

// TODO: Consolidate with sign-up/social-providers.tsx

/**
 * Renders a social provider button for the given `name`. Renders a button that will trigger a sign-in attempt. If your instance does not have the social provider enabled an error will be thrown.
 *
 * @param {string} name - Name of the provider to render
 */
export function SignInSocialProvider({ name, ...rest }: SignInSocialProviderProps) {
  const ref = SignInRouterCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <SocialProvider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

/**
 * Renders the icon of the `<SocialProvider>` it is used within. Hence, it must be used within a `<SocialProvider>`.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <SocialProvider name="google">
 *  <SocialProviderIcon />
 * </SocialProvider>
 */
export const SignInSocialProviderIcon = SocialProviderIcon;
