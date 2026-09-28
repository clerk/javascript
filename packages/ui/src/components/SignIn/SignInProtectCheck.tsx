import { removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { useEffect, useRef, useState } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';

import { ActionBlockedCard, ProtectCheckCard, withRedirectToAfterSignIn } from '../../common';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useNavigateToFlowStart } from '../../hooks/useNavigateToFlowStart';
import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { useRouter } from '../../router';
import { buildSignInOAuthCallbackParams } from './buildOAuthCallbackParams';
import {
  isProtectCheckRequiredError,
  isSignInPendingOAuthTransfer,
  isSignInProtectGated,
  resumeSignInAfterProtectCheck,
} from './handleProtectCheck';

function SignInProtectCheckInternal(): JSX.Element | null {
  const card = useCardState();
  const signIn = useCoreSignIn();
  const { navigate } = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const clerk = useClerk();
  const { setActive, __internal_resumeAfterProtectCheck } = clerk;
  const ctx = useSignInContext();
  const { afterSignInUrl, navigateOnSetActive } = ctx;

  // persist the original status of whether the sign-in is pending an OAuth transfer
  const startedAsOAuthTransfer = useRef(isSignInPendingOAuthTransfer(signIn));

  // persist that a protect check existed at some point
  const [everSawProtectCheck, setEverSawProtectCheck] = useState(!!signIn.protectCheck);
  const didStartNoCheckFallbackRef = useRef(false);

  if (signIn.protectCheck && !everSawProtectCheck) {
    setEverSawProtectCheck(true);
  }

  useEffect(() => {
    if (!signIn.protectCheck && !everSawProtectCheck && !didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [everSawProtectCheck, navigateToFlowStart, signIn.protectCheck]);

  const runner = useProtectCheckRunner<SignInResource>({
    getProtectCheck: () => signIn.protectCheck,
    getResource: () => signIn,
    reload: () => signIn.reload(),
    submitProtectCheck: params => signIn.submitProtectCheck(params),
    // Routes on the resolved resource. This single path finalizes `complete` from both the normal
    // success and the `protect_check_already_resolved` reload, so neither strands the user with an
    // unactivated session.
    onResolved: async (updatedSignIn, isCancelled) => {
      if (isCancelled()) {
        return;
      }
      if (updatedSignIn.status === 'complete' && updatedSignIn.createdSessionId) {
        // A ticket sign-in that would have completed on the start page is completing here
        // instead, so the ticket has to be cleared here too — otherwise it stays in the URL.
        removeClerkQueryParam('__clerk_ticket');
        await setActive({
          session: updatedSignIn.createdSessionId,
          navigate: async ({ session, decorateUrl }) => {
            await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
          },
        });
        return;
      }
      await resumeSignInAfterProtectCheck(updatedSignIn, {
        navigate,
        // No `enterpriseConnectionId` is passed: this runs only under
        // `shouldHandOffToEnterpriseConnection`, which requires a single connection, so the server
        // has exactly one to prepare. If that guard is ever loosened to resume a connection the
        // user chose, the id has to be carried across the challenge and passed here.
        resumeEnterpriseSSO: async () => {
          try {
            await signIn.authenticateWithRedirect({
              strategy: 'enterprise_sso',
              redirectUrl: ctx.ssoCallbackUrl,
              redirectUrlComplete: afterSignInUrl || '/',
              oidcPrompt: ctx.oidcPrompt,
              continueSignIn: true,
            });
          } catch (err) {
            // Preparing the hand-off can raise a further challenge, in which case no redirect was
            // issued: stay here and run it on the next render.
            if (isProtectCheckRequiredError(err) && isSignInProtectGated(signIn)) {
              await navigate('.');
              return;
            }
            throw err;
          }
        },
        startedAsOAuthTransfer: startedAsOAuthTransfer.current,
        resumeOAuthContinuation: () =>
          typeof __internal_resumeAfterProtectCheck === 'function'
            ? __internal_resumeAfterProtectCheck(
                {
                  ...buildSignInOAuthCallbackParams(ctx),
                  continuation: 'transfer_to_sign_up',
                  __internal_navigateOnSetActive: ctx.navigateOnSetActive,
                },
                navigate,
              )
            : navigate('..'),
      });
    },
  });

  // Stale/direct visit that never had a check: render nothing while the flow-start redirect
  // scheduled above kicks in, instead of flashing the card shell for one paint. Must stay
  // below every hook call.
  if (!signIn.protectCheck && !everSawProtectCheck) {
    return null;
  }

  const blockedDetails = actionBlockedDetailsFrom(card.rawError);
  if (blockedDetails) {
    return <ActionBlockedCard details={blockedDetails} />;
  }

  return (
    <ProtectCheckCard
      flow='signIn'
      runner={runner}
    />
  );
}

export const SignInProtectCheck = withRedirectToAfterSignIn(withCardStateProvider(SignInProtectCheckInternal));
