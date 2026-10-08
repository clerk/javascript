import { useCardState } from '../../elements/contexts';
import type { useSignUpRestrictedAccessModel } from './sign-up-restricted-access.model';

export const useSignUpRestrictedAccessController = (model: ReturnType<typeof useSignUpRestrictedAccessModel>) => {
  const card = useCardState();

  return {
    isRestricted: model.isRestricted,
    isWaitlist: model.isWaitlist,
    supportEmail: model.supportEmail,
    signInHref: model.signInHref,
    error: card.error,
    onEmailSupport: () => {
      window.location.href = `mailto:${model.supportEmail}`;
    },
    onWaitlistNavigate: () => {
      void model.navigateToWaitlist();
    },
  };
};
