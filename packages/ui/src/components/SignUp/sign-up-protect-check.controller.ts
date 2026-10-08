import { useEffect, useReducer, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { actionBlockedDetailsFrom } from '@/ui/utils/actionBlocked';

import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import type { ProtectCheckFlowModel } from '../ProtectCheck/protect-check-runner.types';

type Phase = 'neverSeen' | 'seen';

const transition = (phase: Phase, event: 'protectCheckSeen'): Phase => {
  if (phase === 'neverSeen' && event === 'protectCheckSeen') {
    return 'seen';
  }
  return phase;
};

export const useSignUpProtectCheckController = (model: ProtectCheckFlowModel) => {
  const card = useCardState();
  const { hasProtectCheck, navigateToFlowStart } = model;
  // Latches that a protect check existed at some point, so the resolution race
  // (submitProtectCheck clearing protectCheck mid-navigation) isn't mistaken for
  // a stale visit. State adjusted during render (guarded) rather than a ref
  // write, which React disallows in the render body.
  const [phase, send] = useReducer(transition, hasProtectCheck ? 'seen' : 'neverSeen');
  const didStartNoCheckFallbackRef = useRef(false);

  if (hasProtectCheck && phase === 'neverSeen') {
    send('protectCheckSeen');
  }

  useEffect(() => {
    if (!hasProtectCheck && phase === 'neverSeen' && !didStartNoCheckFallbackRef.current) {
      didStartNoCheckFallbackRef.current = true;
      void navigateToFlowStart();
    }
  }, [phase, hasProtectCheck, navigateToFlowStart]);

  const runner = useProtectCheckRunner(model.runner, model.protectCheckConfig);

  return {
    shouldRender: hasProtectCheck || phase === 'seen',
    blockedDetails: actionBlockedDetailsFrom(card.rawError),
    runner,
  };
};
