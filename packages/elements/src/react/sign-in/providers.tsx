import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type { ProviderProps } from '~/react/common/providers';
import { Provider, ProviderIcon } from '~/react/common/providers';
import { useThirdPartyProvider } from '~/react/hooks';
import { SignInRouterCtx } from '~/react/sign-in/context';

export interface SignInProviderProps extends Omit<ProviderProps, 'provider'> {
  name: OAuthProvider | Web3Provider;
}

// TODO: Consolidate with sign-up/providers.tsx

/**
 * Renders a social provider button for the given `name`. Renders a button that will trigger a sign-in attempt. If your instance does not have the social provider enabled an error will be thrown.
 *
 * @param {string} name - Name of the provider to render
 */
export function SignInProvider({ name, ...rest }: SignInProviderProps) {
  const ref = SignInRouterCtx.useActorRef();
  const thirdPartyProvider = useThirdPartyProvider(ref, name);

  return (
    <Provider
      {...rest}
      provider={thirdPartyProvider}
    />
  );
}

/**
 * Renders the icon of the `<Provider>` it is used within. Hence, it must be used within a `<Provider>`.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 *
 * @example
 * <Provider name="google">
 *  <ProviderIcon />
 * </Provider>
 */
export const SignInProviderIcon = ProviderIcon;
