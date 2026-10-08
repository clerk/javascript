import { ActionBlockedCard } from '../../common';
import { ProtectCheckCard } from '../ProtectCheck/ProtectCheckCard';
import type { useSignUpProtectCheckController } from './sign-up-protect-check.controller';

export const SignUpProtectCheckView = ({
  shouldRender,
  blockedDetails,
  runner,
}: ReturnType<typeof useSignUpProtectCheckController>): JSX.Element | null => {
  // Stale/direct visit that never had a check: render nothing while the
  // flow-start redirect scheduled above kicks in, instead of flashing the card
  // shell for one paint. Must stay below every hook call.
  if (!shouldRender) {
    return null;
  }

  if (blockedDetails) {
    return <ActionBlockedCard details={blockedDetails} />;
  }

  return (
    <ProtectCheckCard
      flow='signUp'
      runner={runner}
    />
  );
};
