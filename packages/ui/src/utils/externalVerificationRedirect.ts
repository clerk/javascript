import type { ClerkElectronBridge, ExternalAccountResource, UserResource } from '@clerk/shared/types';

import { openExternalAndWaitForCallback, throwIfNativeRedirectCallbackHasError } from './nativeRedirectCallback';

type CreateExternalAccount = (redirectUrl: string) => Promise<ExternalAccountResource | undefined>;

export async function connectExternalAccountWithElectron(opts: {
  bridge: ClerkElectronBridge;
  createExternalAccount: CreateExternalAccount;
  user: UserResource;
}): Promise<void> {
  const redirectUrl = await opts.bridge.getRedirectUrl();
  const externalAccount = await opts.createExternalAccount(redirectUrl);

  const callbackUrl = await openExternalAndWaitForCallback(
    opts.bridge,
    externalAccount?.verification?.externalVerificationRedirectURL,
  );

  if (!callbackUrl) {
    return;
  }

  throwIfNativeRedirectCallbackHasError(callbackUrl);

  // The reloaded user surfaces any stored verification error inline on the connected-account row,
  // matching the web flow.
  await opts.user.reload();
}
