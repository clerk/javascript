import type { SignUpProps, SignUpResource } from '@clerk/shared/types';
import { type ComponentType, useEffect, useRef, useState } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';

import { ActionBlockedCard, ProtectCheckCard, withRedirectToAfterSignUp } from '../../common';
import { useCoreSignUp } from '../../contexts';
import { useNavigateToFlowStart } from '../../hooks/useNavigateToFlowStart';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useCompleteSignUpFlow } from './useCompleteSignUpFlow';

/**
 * Continuation paths default to the standalone `/sign-up/protect-check` mount. When the card is
 * mounted deeper (e.g. `continue/protect-check` or the combined-flow `create/.../protect-check`),
 * the nested route passes overrides so a resolved gate routes within the correct subtree instead
 * of dead-ending. The verify/self paths resolve correctly from every mount; only `continuePath`
 * differs (the `continue` index is `..`, not `../continue`, once we're already under `continue`).
 */
type SignUpProtectCheckProps = Partial<SignUpProps> & {
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  protectCheckPath?: string;
};

function SignUpProtectCheckInternal({
  verifyEmailPath = '../verify-email-address',
  verifyPhonePath = '../verify-phone-number',
  continuePath = '../continue',
  protectCheckPath = '.',
}: SignUpProtectCheckProps = {}): JSX.Element | null {
  const card = useCardState();
  const signUp = useCoreSignUp();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const completeSignUpFlow = useCompleteSignUpFlow();
  // Latches that a protect check existed at some point, so the resolution race
  // (submitProtectCheck clearing protectCheck mid-navigation) isn't mistaken for
  // a stale visit. State adjusted during render (guarded) rather than a ref
  // write, which React disallows in the render body.
  const [everSawProtectCheck, setEverSawProtectCheck] = useState(!!signUp.protectCheck);
  const didStartNoCheckFallbackRef = useRef(false);

  if (signUp.protectCheck && !everSawProtectCheck) {
    setEverSawProtectCheck(true);
  }

  useEffect(() => {
    if (!signUp.protectCheck && !everSawProtectCheck && !didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [everSawProtectCheck, navigateToFlowStart, signUp.protectCheck]);

  const runner = useProtectCheckRunner<SignUpResource>({
    getProtectCheck: () => signUp.protectCheck,
    getResource: () => signUp,
    reload: () => signUp.reload(),
    submitProtectCheck: params => signUp.submitProtectCheck(params),
    // Routes on the resolved resource. `completeSignUpFlow` handles the `complete` case (via
    // `handleComplete`) as well as routing to the next missing-field / verification / chained-
    // challenge step, so both the normal success and the `protect_check_already_resolved` reload
    // land correctly.
    onResolved: async (updatedSignUp, isCancelled) => {
      if (isCancelled()) {
        return;
      }
      await completeSignUpFlow({
        signUp: updatedSignUp,
        verifyEmailPath,
        verifyPhonePath,
        protectCheckPath, // Defaults to '.' so a chained challenge re-runs this same route
        continuePath,
      });
    },
  });

  // Stale/direct visit that never had a check: render nothing while the
  // flow-start redirect scheduled above kicks in, instead of flashing the card
  // shell for one paint. Must stay below every hook call.
  if (!signUp.protectCheck && !everSawProtectCheck) {
    return null;
  }

  const blockedDetails = actionBlockedDetailsFrom(card.rawError);
  if (blockedDetails) {
    return <ActionBlockedCard details={blockedDetails} />;
  }

  return (
    <ProtectCheckCard
      flow='signUp'
      runner={runner}
    />
  );
}

// The redirect HOC widens props back to the shared component-props union; re-expose the path
// overrides so nested route mounts (continue/protect-check, create/continue/protect-check) can
// pass them.
export const SignUpProtectCheck = withRedirectToAfterSignUp(
  withCardStateProvider(SignUpProtectCheckInternal),
) as ComponentType<SignUpProtectCheckProps>;
