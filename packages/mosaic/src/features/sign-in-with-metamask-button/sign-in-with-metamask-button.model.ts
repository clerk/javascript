import { useClerk } from '@clerk/shared/react';
import type { AuthenticateWithMetamaskParams } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';

export type SignInWithMetamaskButtonOptions = Pick<AuthenticateWithMetamaskParams, 'redirectUrl'>;

export type SignInWithMetamaskButtonModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; onSignIn: () => Promise<unknown> };

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

  return { status: 'ready', onSignIn: () => clerk.authenticateWithMetamask({ redirectUrl }) };
}
