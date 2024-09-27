import type { LoadedClerk, SignUpResource, Web3Strategy } from '@clerk/types';
import { fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';

export type StartAttemptWeb3Input = { clerk: LoadedClerk; strategy: Web3Strategy };
export type StartAttemptWeb3Output = SignUpResource;

export const startAttemptWeb3 = fromPromise<StartAttemptWeb3Output, StartAttemptWeb3Input>(({ input }) => {
  const { clerk, strategy } = input;

  if (strategy === 'web3_metamask_signature') {
    return clerk.client.signUp.authenticateWithMetamask();
  }

  if (strategy === 'web3_coinbase_wallet_signature') {
    return clerk.client.signUp.authenticateWithCoinbaseWallet();
  }

  throw new ClerkElementsRuntimeError(`Unsupported Web3 strategy: ${strategy}`);
});
