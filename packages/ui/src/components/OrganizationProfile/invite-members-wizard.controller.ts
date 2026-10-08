import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';

export const useInviteMembersWizardController = (canRun: () => boolean) => {
  const card = useCardState();
  const [isComplete, setIsComplete] = useState(false);
  const latest = useRef({ card, canRun });
  latest.current = { card, canRun };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const nextStep = () => {
    if (!mounted.current || !latest.current.canRun()) {
      return;
    }
    latest.current.card.setError(undefined);
    setIsComplete(true);
  };
  return { wizardProps: { step: isComplete ? 1 : 0 }, nextStep };
};
