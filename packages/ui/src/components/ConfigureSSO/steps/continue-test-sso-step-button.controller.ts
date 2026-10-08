import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { useSpinDelay } from '@/hooks';
import { handleError } from '@/utils/errorHandler';

import { useWizard } from '../elements/Wizard';
import type { useContinueTestSsoStepButtonModel } from './continue-test-sso-step-button.model';

export const useContinueTestSsoStepButtonController = (
  hasSuccessfulTestRun: boolean,
  revalidateHasSuccessfulTestRun: () => Promise<boolean>,
  model: ReturnType<typeof useContinueTestSsoStepButtonModel>,
) => {
  const card = useCardState();
  const { goNext } = useWizard();
  const mounted = useRef(true);
  const scope = useRef({ key: model.scopeKey, version: 0 });
  if (scope.current.key !== model.scopeKey) {
    scope.current = { key: model.scopeKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const pendingRequest = useRef<object | null>(null);
  const [pendingVersion, setPendingVersion] = useState<number>();
  const isLoading = useSpinDelay(pendingVersion === version);
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingRequest.current = null;
    };
  }, [model.scopeKey]);

  const advance = (): void => {
    card.setError(undefined);
    goNext();
  };

  // The button stays enabled so a user without a successful run still gets the
  // inline validation message (matching legacy), rather than a silently
  // disabled Continue.
  //
  // The local success probe can be stale — e.g. the run that succeeded happened
  // in a different browser tab. So before blocking, revalidate the probe and
  // gate on the genuinely FRESH answer (the resolved value, not the
  // closed-over `hasSuccessfulTestRun` prop, which is the pre-revalidate render
  // value). This picks up a success from elsewhere without a manual "Refresh
  // logs"; we still surface the error when there is genuinely no successful run.
  const handleContinue = async (): Promise<void> => {
    if (!isCurrent() || pendingRequest.current) {
      return;
    }
    if (hasSuccessfulTestRun) {
      advance();
      return;
    }

    const request = {};
    pendingRequest.current = request;
    setPendingVersion(version);
    card.setError(undefined);
    try {
      const hasSuccess = await revalidateHasSuccessfulTestRun();
      if (!isCurrent() || pendingRequest.current !== request) {
        return;
      }
      if (hasSuccess) {
        advance();
        return;
      }
      card.setError(model.noSuccessfulTestRunMessage);
    } catch (err) {
      if (isCurrent() && pendingRequest.current === request) {
        handleError(err as Error, [], card.setError);
      }
    } finally {
      if (pendingRequest.current === request) {
        pendingRequest.current = null;
        if (mounted.current && scope.current.version === version) {
          setPendingVersion(undefined);
        }
      }
    }
  };

  return { isLoading, handleContinue };
};
