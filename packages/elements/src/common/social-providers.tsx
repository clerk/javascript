import { Slot } from '@radix-ui/react-slot';

import { useThirdPartyProviders } from '../internals/machines/sign-in.context';
import { type ThirdPartyStrategy } from '../utils/third-party-strategies';

export function SocialProviders({ render: provider }: { render(provider: ThirdPartyStrategy): React.ReactNode }) {
  const thirdPartyProviders = useThirdPartyProviders();

  if (!thirdPartyProviders) {
    return null;
  }

  return (
    <>
      {thirdPartyProviders.strategies.map(strategy => (
        <Slot
          key={strategy}
          onClick={thirdPartyProviders.createOnClick(strategy)}
        >
          {provider(thirdPartyProviders.strategyToDisplayData[strategy])}
        </Slot>
      ))}
    </>
  );
}
