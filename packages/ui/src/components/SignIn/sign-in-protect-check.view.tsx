import { ActionBlockedCard } from '../../common';
import { ProtectCheckCard } from '../ProtectCheck/ProtectCheckCard';
import type { useSignInProtectCheckController } from './sign-in-protect-check.controller';

export const SignInProtectCheckView = ({
  showCard,
  blockedDetails,
  runner,
}: ReturnType<typeof useSignInProtectCheckController>) => {
  if (!showCard) {
    return null;
  }

  if (blockedDetails) {
    return <ActionBlockedCard details={blockedDetails} />;
  }

  return (
    <ProtectCheckCard
      flow='signIn'
      runner={runner}
    />
  );
};
