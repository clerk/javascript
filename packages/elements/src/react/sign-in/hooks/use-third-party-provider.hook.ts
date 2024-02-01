import type { OAuthProvider, Web3Provider } from '@clerk/types';
import { useSelector } from '@xstate/react';
import type React from 'react';
import { useCallback } from 'react';

import { THIRD_PARTY_MACHINE_ID } from '~/internals/machines/third-party/machine';
import type { UseThirdPartyProviderReturn } from '~/react/common/third-party-providers/social-provider';
import type { SnapshotState } from '~/react/sign-in/contexts/sign-in.context';
import { SignInCtx } from '~/react/sign-in/contexts/sign-in.context';

/**
 * Selects the clerk third-party provider
 */
const selector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotState) =>
  state.context.thirdPartyProviders.providerToDisplayData[provider];

// const selector = (provider: OAuthProvider | Web3Provider) => (state: SnapshotState) =>
//   state.children.ThirdParty.context.thirdPartyProviders.providerToDisplayData[provider];

// get(THIRD_PARTY_MACHINE_ID)?.context.thirdPartyProviders.providerToDisplayData[provider];

export const useThirdPartyProvider = (provider: OAuthProvider | Web3Provider): UseThirdPartyProviderReturn => {
  const ref = SignInCtx.useActorRef();
  const testing = useSelector(
    ref.system.get(THIRD_PARTY_MACHINE_ID),
    // ref.getSnapshot().children.ThirdParty!,
    state => state.context.thirdPartyProviders.providerToDisplayData[provider],
  );

  console.log('testing', testing);

  // const details = SignInCtx.useSelector(selector(provider));

  const details = SignInCtx.useSelector(selector(provider));
  // const actor = useActorRef(ref.getSnapshot().children.ThirdParty!);

  // const test = useSelector(ref, state => state.children.ThirdParty?.);
  // const actor = useActorRef(test!);
  // console.log(test);

  // console.log(ref.getSnapshot().children.ThirdParty?.getSnapshot().context);

  // console.log(ref.getSnapshot().children);

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
