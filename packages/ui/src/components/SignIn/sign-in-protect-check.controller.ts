import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';

import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import type { ProtectCheckFlowModel } from '../ProtectCheck/protect-check-runner.types';

export const useSignInProtectCheckController = (model: ProtectCheckFlowModel) => {
  const card = useCardState();
  const { hasProtectCheck, navigateToFlowStart } = model;
  // persist that a protect check existed at some point
  const [everSawProtectCheck, setEverSawProtectCheck] = useState(hasProtectCheck);
  const didStartNoCheckFallbackRef = useRef(false);

  if (hasProtectCheck && !everSawProtectCheck) {
    setEverSawProtectCheck(true);
  }

  useEffect(() => {
    if (!hasProtectCheck && !everSawProtectCheck && !didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [everSawProtectCheck, navigateToFlowStart, hasProtectCheck]);

  const runner = useProtectCheckRunner(model.runner, model.protectCheckConfig);

  // Stale/direct visit that never had a check: render nothing while the flow-start redirect
  // scheduled above kicks in, instead of flashing the card shell for one paint. Must stay
  // below every hook call.
  return {
    showCard: hasProtectCheck || everSawProtectCheck,
    blockedDetails: actionBlockedDetailsFrom(card.rawError),
    runner,
  };
};
