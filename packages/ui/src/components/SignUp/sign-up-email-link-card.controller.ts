import { useEffect, useReducer } from 'react';

import { handleError } from '@/ui/utils/errorHandler';

import { useCardState } from '../../elements/contexts';
import type { useSignUpEmailLinkCardModel } from './sign-up-email-link-card.model';

type Phase = 'waiting' | 'verifiedSwitchTab';

const transition = (phase: Phase, event: 'verifiedSwitchTab'): Phase => {
  if (phase === 'waiting' && event === 'verifiedSwitchTab') {
    return 'verifiedSwitchTab';
  }
  return phase;
};

export const useSignUpEmailLinkCardController = (model: ReturnType<typeof useSignUpEmailLinkCardModel>) => {
  const card = useCardState();
  const [phase, send] = useReducer(transition, 'waiting');

  const startEmailLinkVerification = () => {
    return model
      .startVerification()
      .then(async resource => {
        const result = model.getVerificationResult(resource);
        if (result === 'expired') {
          card.setError(model.expiredError());
        } else if (result === 'verifiedSwitchTab') {
          send('verifiedSwitchTab');
        } else {
          await model.completeVerification(resource);
        }
      })
      .catch(error => {
        handleError(error, [], card.setError);
      });
  };

  useEffect(() => {
    void startEmailLinkVerification();
  }, []);

  const restartVerification = () => {
    model.cancelVerification();
    void startEmailLinkVerification();
  };

  return {
    showVerifyModal: phase === 'verifiedSwitchTab',
    emailAddress: model.emailAddress,
    onResend: restartVerification,
  };
};
