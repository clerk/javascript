import type { OAuthProvider, Web3Provider } from '@clerk/types';
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
  name: OAuthProvider | Web3Provider;
}

export function Connection({ asChild, name, ...rest }: ConnectionProps) {
  const signInRef = SignInRouterCtx.useActorRef(true);
  const signUpRef = SignUpRouterCtx.useActorRef(true);
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
