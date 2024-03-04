import { Slot } from '@radix-ui/react-slot';

import type { ThirdPartyProvider } from '~/utils/third-party-strategies';

export type UseThirdPartyProviderReturn =
  | (ThirdPartyProvider & {
      events: {
        authenticate: (event: React.MouseEvent<Element>) => void;
      };
    })
  | null;

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
    <Comp
      onClick={provider.events.authenticate}
      {...defaultProps}
      {...rest}
    />
  );
}
