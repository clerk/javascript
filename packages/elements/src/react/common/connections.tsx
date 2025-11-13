import type { EnterpriseSSOStrategy, OAuthProvider, SamlStrategy, Web3Provider } from '@clerk/shared/types';
import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext } from 'react';

import type { ThirdPartyProvider } from '~/utils/third-party-strategies';

import { useThirdPartyProvider } from '../hooks';
import { SignInRouterCtx } from '../sign-in/context';
import { SignUpRouterCtx } from '../sign-up/context';

export type UseThirdPartyProviderReturn =
  | (ThirdPartyProvider & {
      events: {
        authenticate: (event: React.MouseEvent<Element>) => void;
      };
    })
  | null;

export const ConnectionContext = createContext<ThirdPartyProvider | null>(null);
export const useConnectionContext = () => {
  const ctx = useContext(ConnectionContext);

  if (!ctx) {
    throw new Error('useConnectionContext must be used within <Clerk.Connection>');
  }

  return ctx;
};

export interface ConnectionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  name: OAuthProvider | Web3Provider | SamlStrategy | EnterpriseSSOStrategy;
}

/**
 * Renders a social connection button based on the provided name. If your instance does not have the social connection enabled, this component will throw an error in development.
 *
 * **Tip:** You can use the `<Icon />` component to render the social connection icon.
 *
 * @param {boolean} [asChild] - If true, `<Connection />` will render as its child element, passing along any necessary props.
 * @param {OAuthProvider | Web3Provider} name - The name of the social connection to render.
 *
 * @example
 * <SignIn.Root>
 *  <SignIn.Step name="start">
 *    <Clerk.Connection name="google">
 *      Sign in with Google
 *    </Clerk.Connection>
 *  </SignIn.Step>
 * </SignIn.Root>
 */
export function Connection({ asChild, name, ...rest }: ConnectionProps) {
  const signInRef = SignInRouterCtx.useActorRef(true);
  const signUpRef = SignUpRouterCtx.useActorRef(true);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const provider = useThirdPartyProvider((signInRef || signUpRef)!, name);

  if (!provider) {
    return null;
  }

  const Comp = asChild ? Slot : 'button';
  const defaultProps = asChild ? {} : { type: 'button' as const };

  return (
    <ConnectionContext.Provider value={provider}>
      <Comp
        onClick={provider.events.authenticate}
        {...defaultProps}
        {...rest}
      />
    </ConnectionContext.Provider>
  );
}

export interface IconProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'> {
  asChild?: boolean;
}

/**
 * `<Icon>` **must** be used inside `<Connection>`. By default, `<Icon>` will render as an `<img>` element with the `src` pointing to the logo of the currently used `<Connection>`.
 *
 * @param {boolean} [asChild] - If true, `<Icon />` will render as its child element, passing along any necessary props.
 *
 * @example
 * <SignIn.Root>
 *  <SignIn.Step name="start">
 *    <Clerk.Connection name="google">
 *      <Clerk.Icon />
 *      Sign in with Google
 *    </Clerk.Connection>
 *  </SignIn.Step>
 * </SignIn.Root>
 */
export function Icon({ asChild, ...rest }: IconProps) {
  const { iconUrl, name } = useConnectionContext();

  const Comp = asChild ? Slot : 'img';
  return (
    <Comp
      alt={`${name} logo`}
      src={iconUrl}
      {...rest}
    />
  );
}
