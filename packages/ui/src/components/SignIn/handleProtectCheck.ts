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

/**
 * Whether this sign-in is waiting to become a sign-up.
 *
 * An OAuth sign-in for an identity that has no account yet comes back as a *transferable*
 * first-factor verification: the server has recorded the account transfer and the client is
 * expected to complete it as a sign-up. It is not a sign-in that can continue on its own,
 * and none of the interactive sign-in steps apply to it.
 *
 * Read this BEFORE clearing a gate, never after — see `resumeSignInAfterProtectCheck`.
 */
export function isSignInPendingOAuthTransfer(signIn: SignInResource): boolean {
  return signIn.firstFactorVerification?.status === 'transferable';
}

/**
 * The exit choke point, and the counterpart to `navigateOnSignInProtectGate` above.
 *
 * The gate has two halves and both live in this file: one for routing *into* the challenge,
 * one for routing *out* of it. A new caller needs both — a card that enters through the
 * helper and then hand-rolls its own exit is exactly the shape that produced the outage this
 * function was written for.
 *
 * `resumeOAuthContinuation` is how the card hands back to the redirect-callback router. It is
 * injected rather than called directly so this module stays free of the Clerk instance.
 */
export function resumeSignInAfterProtectCheck(
  signIn: SignInResource,
  {
    navigate,
    resumeOAuthContinuation,
    startedAsOAuthTransfer,
  }: {
    navigate: (to: string) => Promise<unknown>;
    resumeOAuthContinuation: () => Promise<unknown>;
    startedAsOAuthTransfer: boolean;
  },
): Promise<unknown> {
  // Chained challenge — stay here and re-run the new challenge on next render. Both
  // signals are checked: `protectCheck` is the authoritative field, and
  // `'needs_protect_check'` is the SDK-version-gated status.
  if (isSignInProtectGated(signIn)) {
    return navigate('.');
  }

  switch (signIn.status) {
    case 'needs_first_factor':
      return navigate('../factor-one');
    case 'needs_second_factor':
      return navigate('../factor-two');
    case 'needs_client_trust':
      return navigate('../client-trust');
    case 'needs_new_password':
      return navigate('../reset-password');
    case 'complete':
      // Finalization is handled by the caller via setActive; just bounce to index.
      return startedAsOAuthTransfer || isSignInPendingOAuthTransfer(signIn)
        ? resumeOAuthContinuation()
        : navigate('..');
    default:
      // Everything above is an interactive sign-in step the user can be shown. Anything
      // else means this sign-in cannot continue on its own, and today that is an OAuth
      // account transfer: `needs_identifier` carrying a transferable first-factor
      // verification, whose continuation lives in the redirect-callback router.
      //
      // Returning to the start form instead is not merely a wrong destination — the start
      // card renders the transfer's `external_account_not_found` error and then calls
      // `signIn.create({})` to clear it, which replaces the attempt and discards the only
      // reference to the pending transfer. The user is then stranded permanently, and every
      // retry reproduces it.
      return startedAsOAuthTransfer || isSignInPendingOAuthTransfer(signIn)
        ? resumeOAuthContinuation()
        : navigate('..');
  }
}
