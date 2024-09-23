import type { LoadedClerk, SignInResource, Web3Strategy } from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';

export type AttemptWeb3Input = { clerk: LoadedClerk; strategy: Web3Strategy };
export type AttemptWeb3Output = SignInResource;

export const attemptWeb3 = fromPromise<AttemptWeb3Output, AttemptWeb3Input>(({ input }) => {
  const { clerk, strategy } = input;

  if (strategy === 'web3_metamask_signature') {
    return clerk.client.signIn.authenticateWithMetamask();
  }

  if (strategy === 'web3_coinbase_wallet_signature') {
    return clerk.client.signIn.authenticateWithCoinbaseWallet();
  }

  throw new ClerkElementsRuntimeError(`Unsupported Web3 strategy: ${strategy}`);
});
