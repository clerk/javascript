// ================= useSocialProviderContext ================= //

import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext } from 'react';

import type { ThirdPartyProvider } from '~/utils/third-party-strategies';

export type UseThirdPartyProviderReturn =
  | (ThirdPartyProvider & {
      events: {
        authenticate: (event: React.MouseEvent<Element>) => void;
      };
    })
  | null;

export const SocialProviderContext = createContext<ThirdPartyProvider | null>(null);
export const useSocialProviderContext = () => {
  const ctx = useContext(SocialProviderContext);

  if (!ctx) {
    throw new Error('useSocialProviderContext must be used within SignInSocialProvider');
  }

  return ctx;
};

export interface SocialProviderProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  provider: UseThirdPartyProviderReturn | undefined | null;
}

export function SocialProvider({ asChild, provider, ...rest }: SocialProviderProps) {
  if (!provider) {
    return null;
  }

  const Comp = asChild ? Slot : 'button';

  return (
    <SocialProviderContext.Provider value={provider}>
      <Comp
        onClick={provider.events.authenticate}
        {...rest}
      />
    </SocialProviderContext.Provider>
  );
}

export interface SocialProviderIconProps extends React.HTMLAttributes<HTMLImageElement> {
  asChild?: boolean;
}

export function SocialProviderIcon({ asChild, ...rest }: SocialProviderIconProps) {
  const { iconUrl, name } = useSocialProviderContext();

  const Comp = asChild ? Slot : 'img';
  return (
    <Comp
      alt={`Sign in with ${name}`}
      src={iconUrl}
      {...rest}
    />
  );
}
