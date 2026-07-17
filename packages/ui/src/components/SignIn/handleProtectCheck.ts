import type { SignInResource } from '@clerk/shared/types';

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
