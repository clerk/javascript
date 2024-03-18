import type { OAuthProvider, Web3Provider } from '@clerk/types';
import { useSelector } from '@xstate/react';
import type React from 'react';
import { useCallback } from 'react';
import type { ActorRef, SnapshotFrom } from 'xstate';

import type { SignInRouterEvents } from '~/internals/machines/sign-in/types';
import type { SignUpRouterEvents } from '~/internals/machines/sign-up/types';
import { type ThirdPartyMachine, ThirdPartyMachineId } from '~/internals/machines/third-party/machine';
import type { UseThirdPartyProviderReturn } from '~/react/common/providers';

/**
 * Selects the clerk third-party provider
 */
const selector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotFrom<typeof ThirdPartyMachine>) =>
  state?.context.thirdPartyProviders.providerToDisplayData[provider];

export const useThirdPartyProvider = <
  TActor extends ActorRef<any, SignInRouterEvents> | ActorRef<any, SignUpRouterEvents>,
>(
  ref: TActor,
  provider: OAuthProvider | Web3Provider,
): UseThirdPartyProviderReturn => {
  const details = useSelector(ref.system.get(ThirdPartyMachineId), selector(provider));

  const authenticate = useCallback(
    (event: React.MouseEvent<Element>) => {
      if (!details) return;

      event.preventDefault();

      if (provider === 'metamask') {
        return ref.send({ type: 'AUTHENTICATE.WEB3', strategy: 'web3_metamask_signature' });
      }

      return ref.send({ type: 'AUTHENTICATE.OAUTH', strategy: `oauth_${provider}` });
    },
    [provider, details, ref],
  );

  if (!details) {
    console.error(
      `Please ensure that ${provider} is enabled for your project. Go to your Clerk dashboard and navigate to "User & Authentication" > "Social Connections" to enable it.`,
    );
    return null;
  }

  return {
    events: {
      authenticate,
    },
    ...details,
  };
};
