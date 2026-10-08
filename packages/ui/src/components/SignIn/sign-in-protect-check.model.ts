import { removeClerkQueryParam } from '@clerk/shared/internal/clerk-js/queryParams';
import { useClerk } from '@clerk/shared/react';
import type { SignInResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { useNavigateToFlowStart } from '../../hooks/useNavigateToFlowStart';
import { useRouter } from '../../router';
import { useProtectCheckConfigModel } from '../ProtectCheck/protect-check.config.model';
import { createProtectCheckRunnerModel } from '../ProtectCheck/protect-check-runner.model';
import type { ProtectCheckFlowModel } from '../ProtectCheck/protect-check-runner.types';
import { buildSignInOAuthCallbackParams } from './buildOAuthCallbackParams';
import {
  isProtectCheckRequiredError,
  isSignInPendingOAuthTransfer,
  isSignInProtectGated,
  resumeSignInAfterProtectCheck,
} from './handleProtectCheck';

export const useSignInProtectCheckModel = (): ProtectCheckFlowModel => {
  const signIn = useCoreSignIn();
  const startedAsOAuthTransfer = useRef(isSignInPendingOAuthTransfer(signIn)).current;
  const { navigate } = useRouter();
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const clerk = useClerk();
  const ctx = useSignInContext();
  const protectCheckConfig = useProtectCheckConfigModel();
  const { afterSignInUrl, navigateOnSetActive } = ctx;

  const onResolved = async (updatedSignIn: SignInResource, isCancelled: () => boolean) => {
    if (isCancelled()) {
      return;
    }
    if (updatedSignIn.status === 'complete' && updatedSignIn.createdSessionId) {
      // A ticket sign-in that would have completed on the start page is completing here
      // instead, so the ticket has to be cleared here too — otherwise it stays in the URL.
      removeClerkQueryParam('__clerk_ticket');
      await clerk.setActive({
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
      startedAsOAuthTransfer,
      resumeOAuthContinuation: () =>
        typeof clerk.__internal_resumeAfterProtectCheck === 'function'
          ? clerk.__internal_resumeAfterProtectCheck(
              {
                ...buildSignInOAuthCallbackParams(ctx),
                continuation: 'transfer_to_sign_up',
                __internal_navigateOnSetActive: ctx.navigateOnSetActive,
              },
              navigate,
            )
          : navigate('..'),
    });
  };

  return {
    hasProtectCheck: Boolean(signIn.protectCheck),
    navigateToFlowStart,
    protectCheckConfig,
    runner: createProtectCheckRunnerModel(signIn, onResolved),
  };
};
