import type { OAuthProvider, Web3Provider } from '@clerk/types';
import type React from 'react';
import { useCallback } from 'react';
import type { SnapshotFrom } from 'xstate';

import type { SignUpMachine } from '~/internals/machines/sign-up/sign-up.machine';
import type { UseThirdPartyProviderReturn } from '~/react/common/third-party-providers/social-provider';
import { SignUpCtx } from '~/react/sign-up/contexts/sign-up.context';

export type SnapshotState = SnapshotFrom<typeof SignUpMachine>;

/**
 * Selects the clerk third-party provider
 */
const clerkThirdPartyProviderSelector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotState) =>
  state.context.thirdPartyProviders.providerToDisplayData[provider];

export const useThirdPartyProvider = (provider: OAuthProvider | Web3Provider): UseThirdPartyProviderReturn => {
  const ref = SignUpCtx.useActorRef();
  const details = SignUpCtx.useSelector(clerkThirdPartyProviderSelector(provider));

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
