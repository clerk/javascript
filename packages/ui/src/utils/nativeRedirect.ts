import { ClerkAPIResponseError } from '@clerk/shared/error';
import type {
  AuthenticateWithNativeRedirectParams,
  ClerkAPIError,
  ClerkElectronBridge,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  LoadedClerk,
  SignInResource,
  SignUpResource,
} from '@clerk/shared/types';

import {
  createNativeRedirectIncompleteError,
  getRotatingTokenNonceFromNativeRedirectCallback,
  openExternalAndWaitForCallback,
  throwIfNativeRedirectCallbackHasError,
} from './nativeRedirectCallback';

type Navigate = (to: string) => Promise<unknown>;

type CallbackParams = HandleOAuthCallbackParams | HandleSamlCallbackParams;

type SignUpNativeRedirectParams = Parameters<SignUpResource['__experimental_authenticateWithNativeRedirect']>[0];
type NativeRedirectResource = SignInResource | SignUpResource;

const BARE_CALLBACK_RESOURCE_POLL_TIMEOUT_MS = 3_000;
const BARE_CALLBACK_RESOURCE_POLL_INTERVAL_MS = 250;

function isSignUpResource(resource: NativeRedirectResource): resource is SignUpResource {
  return 'missingFields' in resource;
}

function getExternalVerification(resource: NativeRedirectResource) {
  return isSignUpResource(resource) ? resource.verifications.externalAccount : resource.firstFactorVerification;
}

function getExternalVerificationRedirectURL(resource: NativeRedirectResource): URL | null {
  return getExternalVerification(resource).externalVerificationRedirectURL;
}

function getExternalVerificationError(resource: NativeRedirectResource): ClerkAPIError | null {
  return getExternalVerification(resource).error;
}

/**
 * Re-wraps the `ClerkAPIError` stored on a verification into a `ClerkAPIResponseError` so the shared
 * UI error handler treats it like any other server error and renders it on the card.
 */
function createNativeRedirectAPIResponseError(error: ClerkAPIError): ClerkAPIResponseError {
  return new ClerkAPIResponseError(error.longMessage || error.message, {
    status: 400,
    data: [
      {
        code: error.code,
        message: error.message,
        long_message: error.longMessage,
        meta: {
          param_name: error.meta?.paramName,
          session_id: error.meta?.sessionId,
          email_addresses: error.meta?.emailAddresses,
          identifiers: error.meta?.identifiers,
          zxcvbn: error.meta?.zxcvbn,
        },
      },
    ],
  });
}

function throwIfVerificationError(resource: NativeRedirectResource): void {
  const error = getExternalVerificationError(resource);

  if (error) {
    throw createNativeRedirectAPIResponseError(error);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Native success/progression callbacks (including `transferable`) carry a `rotating_token_nonce`;
 * failures (e.g. the user denied access) do not, but FAPI stores the error on the verification.
 * After such a bare callback we reload until the error appears or we time out.
 */
async function reloadUntilVerificationErrorOrTimeout(
  resource: NativeRedirectResource,
): Promise<NativeRedirectResource> {
  const startedAt = Date.now();
  let reloadedResource = await resource.reload();

  while (Date.now() - startedAt < BARE_CALLBACK_RESOURCE_POLL_TIMEOUT_MS) {
    if (getExternalVerificationError(reloadedResource)) {
      return reloadedResource;
    }

    await delay(BARE_CALLBACK_RESOURCE_POLL_INTERVAL_MS);
    reloadedResource = await resource.reload();
  }

  return reloadedResource;
}

export function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  bridge: ClerkElectronBridge;
  resource: SignInResource;
  params: AuthenticateWithNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown>;

export function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  bridge: ClerkElectronBridge;
  resource: SignUpResource;
  params: SignUpNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown>;

export async function authenticateWithNativeRedirect(opts: {
  clerk: LoadedClerk;
  bridge: ClerkElectronBridge;
  resource: SignInResource | SignUpResource;
  params: AuthenticateWithNativeRedirectParams | SignUpNativeRedirectParams;
  callbackParams: CallbackParams;
  navigate: Navigate;
}): Promise<unknown> {
  const redirectUrl = await opts.bridge.getRedirectUrl();
  const params = { ...opts.params, redirectUrl };
  const resource = isSignUpResource(opts.resource)
    ? await opts.resource.__experimental_authenticateWithNativeRedirect(params as SignUpNativeRedirectParams)
    : await opts.resource.__experimental_authenticateWithNativeRedirect(params as AuthenticateWithNativeRedirectParams);

  const callbackUrl = await openExternalAndWaitForCallback(opts.bridge, getExternalVerificationRedirectURL(resource));

  // No external verification step was required.
  if (!callbackUrl) {
    return;
  }

  // A callback URL means the provider flow ran to completion (success OR error) - it is not a
  // cancellation. Only a missing callback (rejected above by `openExternalAndWaitForCallback`) is.
  throwIfNativeRedirectCallbackHasError(callbackUrl);

  const rotatingTokenNonce = getRotatingTokenNonceFromNativeRedirectCallback(callbackUrl);

  // FAPI only issues a rotating token nonce once the verification succeeds (this includes the
  // `transferable` outcome), so its presence is the success signal. Hand off to the shared
  // post-callback navigation/setActive logic, which mirrors the web `handleRedirectCallback`.
  if (rotatingTokenNonce) {
    const reloadedResource = await resource.reload({ rotatingTokenNonce });
    throwIfVerificationError(reloadedResource);
    return opts.clerk.__experimental_handleNativeRedirectCallback(reloadedResource, opts.callbackParams, opts.navigate);
  }

  // No nonce: the provider flow failed (e.g. the user denied access). FAPI stores the error on the
  // verification, so reload until it appears. Surface it on the card - the native UI never remounts,
  // so it cannot rely on the mount-time error effect the web sign-in page uses.
  const reloadedResource = await reloadUntilVerificationErrorOrTimeout(resource);
  throwIfVerificationError(reloadedResource);

  // A callback arrived without a nonce and without a stored error: surface a generic error rather
  // than ending the flow silently.
  throw createNativeRedirectIncompleteError();
}
