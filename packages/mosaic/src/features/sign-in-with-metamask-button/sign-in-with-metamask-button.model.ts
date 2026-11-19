import { useClerk } from '@clerk/shared/react';
import type { AuthenticateWithMetamaskParams } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import type { ClerkCall } from '../clerk/errors';
import { callClerk } from '../clerk/errors';

export type SignInWithMetamaskButtonOptions = Pick<AuthenticateWithMetamaskParams, 'redirectUrl'>;

export type SignInWithMetamaskButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; onSignIn: () => ClerkCall<unknown> };

export function useSignInWithMetamaskButtonModel({
  redirectUrl,
}: SignInWithMetamaskButtonOptions): SignInWithMetamaskButtonModel {
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  if (!clerk.loaded || !environment) {
    return { status: 'loading' };
  }

  if (!environment.userSettings.web3FirstFactors.includes('web3_metamask_signature')) {
    return { status: 'hidden' };
  }

  return { status: 'ready', onSignIn: () => callClerk(() => clerk.authenticateWithMetamask({ redirectUrl })) };
}
