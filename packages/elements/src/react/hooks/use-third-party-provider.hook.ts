import type { OAuthProvider, Web3Provider } from '@clerk/types';
import { useSelector } from '@xstate/react';
import type React from 'react';
import { useCallback } from 'react';
import type { ActorRef, SnapshotFrom } from 'xstate';

import type { SignInStartEvents } from '~/internals/machines/sign-in/start/types';
import type { SignUpMachineEvents } from '~/internals/machines/sign-up/sign-up.machine';
import type { ThirdPartyMachine } from '~/internals/machines/third-party/machine';
import { THIRD_PARTY_MACHINE_ID } from '~/internals/machines/third-party/machine';
import type { UseThirdPartyProviderReturn } from '~/react/common/third-party-providers/social-provider';

/**
 * Selects the clerk third-party provider
 */
const selector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotFrom<typeof ThirdPartyMachine>) =>
  state.context.thirdPartyProviders.providerToDisplayData[provider];

export const useThirdPartyProvider = <
  TActor extends ActorRef<any, SignInStartEvents> | ActorRef<any, SignUpMachineEvents>,
>(
  ref: TActor,
  provider: OAuthProvider | Web3Provider,
): UseThirdPartyProviderReturn => {
  const details = useSelector(ref.system.get(THIRD_PARTY_MACHINE_ID), selector(provider));

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
    console.warn(`Please ensure that ${provider} is enabled.`);
    return null;
  }

  return {
    events: {
      authenticate,
    },
    ...details,
  };
};
