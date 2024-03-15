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

export const ProviderContext = createContext<ThirdPartyProvider | null>(null);
export const useSocialProviderContext = () => {
  const ctx = useContext(ProviderContext);

  if (!ctx) {
    throw new Error('useSocialProviderContext must be used within SignInSocialProvider');
  }

  return ctx;
};

export interface ProviderProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  provider: UseThirdPartyProviderReturn | undefined | null;
}

export function Provider({ asChild, provider, ...rest }: ProviderProps) {
  if (!provider) {
    return null;
  }

  const Comp = asChild ? Slot : 'button';
  const defaultProps = asChild ? {} : { type: 'button' as const };

  return (
    <ProviderContext.Provider value={provider}>
      <Comp
        onClick={provider.events.authenticate}
        {...defaultProps}
        {...rest}
      />
    </ProviderContext.Provider>
  );
}

export interface ProviderIconProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'> {
  asChild?: boolean;
}

export function ProviderIcon({ asChild, ...rest }: ProviderIconProps) {
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
