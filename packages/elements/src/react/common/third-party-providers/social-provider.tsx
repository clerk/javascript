import { Slot } from '@radix-ui/react-slot';
import { createContext, useContext } from 'react';

import type { ThirdPartyProvider } from '~/utils/third-party-strategies';

export type UseThirdPartyProviderReturn = {
  provider?: ThirdPartyProvider;
  events: {
    authenticate: (event: React.MouseEvent<Element>) => void;
  };
  isLoading: boolean;
  isDisabled: boolean;
} | null;

export const SocialProviderContext = createContext<{
  provider: ThirdPartyProvider;
  isLoading: boolean;
  isDisabled: boolean;
} | null>(null);
export const useSocialProviderContext = () => {
  const ctx = useContext(SocialProviderContext);

  if (!ctx) {
    throw new Error('useSocialProviderContext must be used within SignInSocialProvider');
  }

  return ctx;
};

export type SocialProviderProps = React.HTMLAttributes<HTMLButtonElement> &
  UseThirdPartyProviderReturn & {
    asChild?: boolean;
  };

export function SocialProvider({ asChild, provider, events, isLoading, isDisabled, ...rest }: SocialProviderProps) {
  if (!provider) {
    return null;
  }

  const Comp = asChild ? Slot : 'button';

  return (
    <SocialProviderContext.Provider value={{ provider, isLoading, isDisabled }}>
      <Comp
        type='button'
        onClick={events.authenticate}
        disabled={isDisabled}
        data-loading={isLoading}
        {...rest}
      />
    </SocialProviderContext.Provider>
  );
}

export interface SocialProviderIconProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'src'> {
  asChild?: boolean;
}

export function SocialProviderIcon({ asChild, ...rest }: SocialProviderIconProps) {
  const {
    provider: { iconUrl, name },
  } = useSocialProviderContext();

  const Comp = asChild ? Slot : 'img';
  return (
    <Comp
      alt={`${name} logo`}
      src={iconUrl}
      {...rest}
    />
  );
}
