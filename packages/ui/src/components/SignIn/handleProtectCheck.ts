import type { SignInResource } from '@clerk/shared/types';

import { shouldHandOffToEnterpriseConnection } from './enterpriseSSOFactors';

/**
 * Detects whether a sign-in response is gated by Clerk Protect.
 *
 * The `protectCheck` field is the authoritative gating signal; new SDKs / newer servers
 * also surface `status === 'needs_protect_check'`. Either signal triggers navigation
 * to the protect-check route.
 */
export function isSignInProtectGated(signIn: SignInResource): boolean {
  return !!signIn.protectCheck || signIn.status === 'needs_protect_check';
}

/**
 * Single choke point for routing a Clerk Protect gate during sign-in.
 *
 * Every sign-in operation that returns a `SignInResource` (create, attempt/prepare first/second
 * factor, passkey, reset-password, web3, …) can be gated mid-flow, and a missed call site strands
 * the user at the previous step. Funnel them all through this helper: call it right after the
 * operation resolves and `return` when it returns `true`, before dispatching on `signIn.status`.
 *
 * The `protectCheckPath` is supplied per call site because the prebuilt UI mounts sign-in steps at
 * different route depths — `SignInStart` (index) reaches the route at `'protect-check'`, the factor
 * cards reach it at `'../protect-check'`.
 *
 * @returns `true` if the response was gated and navigation was issued (caller should stop).
 */
export function navigateOnSignInProtectGate(
  signIn: SignInResource,
  navigate: (to: string) => Promise<unknown>,
  protectCheckPath: string,
): boolean {
  if (isSignInProtectGated(signIn)) {
    void navigate(protectCheckPath);
    return true;
  }
  return false;
}

/**
 * Whether this sign-in is waiting to become a sign-up.
 */
export function isSignInPendingOAuthTransfer(signIn: SignInResource): boolean {
  return signIn.firstFactorVerification?.status === 'transferable';
}

export function resumeSignInAfterProtectCheck(
  signIn: SignInResource,
  {
    navigate,
    resumeEnterpriseSSO,
    resumeOAuthContinuation,
    startedAsOAuthTransfer,
  }: {
    navigate: (to: string) => Promise<unknown>;
    resumeEnterpriseSSO: () => Promise<unknown>;
    resumeOAuthContinuation: () => Promise<unknown>;
    startedAsOAuthTransfer: boolean;
  },
): Promise<unknown> {
  // A chained gate: stay on this route so the new challenge runs on the next render.
  if (isSignInProtectGated(signIn)) {
    return navigate('.');
  }

  switch (signIn.status) {
    case 'needs_first_factor':
      // An SSO-only sign-in has no first factor to render — the hand-off to the identity
      // provider is the next step, and it was interrupted before it could be issued.
      if (shouldHandOffToEnterpriseConnection(signIn)) {
        return resumeEnterpriseSSO();
      }
      return navigate('../factor-one');
    case 'needs_second_factor':
      return navigate('../factor-two');
    case 'needs_client_trust':
      return navigate('../client-trust');
    case 'needs_new_password':
      return navigate('../reset-password');
    default:
      return startedAsOAuthTransfer || isSignInPendingOAuthTransfer(signIn)
        ? resumeOAuthContinuation()
        : navigate('..');
  }
}
