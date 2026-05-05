import type { SignInResource } from '@clerk/shared/types';

/**
 * Detects whether a sign-in response is gated by Clerk Protect (per spec §2.2.2).
 *
 * The `protectCheck` field is the authoritative gating signal; new SDKs / newer servers
 * also surface `status === 'needs_protect_check'`. Either signal triggers navigation
 * to the protect-check route.
 */
export function isSignInProtectGated(signIn: SignInResource): boolean {
  return !!signIn.protectCheck || signIn.status === 'needs_protect_check';
}
