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
  const defaultProps = asChild ? {} : { type: 'button' as const };

  return (
    <SocialProviderContext.Provider value={provider}>
      <Comp
        onClick={provider.events.authenticate}
        {...defaultProps}
        {...rest}
      />
    </SocialProviderContext.Provider>
  );
}

export interface SocialProviderIconProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'> {
  asChild?: boolean;
}

export function SocialProviderIcon({ asChild, ...rest }: SocialProviderIconProps) {
  const { iconUrl, name } = useSocialProviderContext();

  const Comp = asChild ? Slot : 'img';
  return (
    <Comp
      alt={`${name} logo`}
      src={iconUrl}
      {...rest}
    />
  );
}
