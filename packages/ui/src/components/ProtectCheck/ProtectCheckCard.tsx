import type { ProtectCheckRunnerState } from '../../hooks/useProtectCheckRunner';
import { useProtectCheckCardController } from './protect-check-card.controller';
import { ProtectCheckCardView } from './protect-check-card.view';

type ProtectCheckCardProps = {
  flow: 'signIn' | 'signUp';
  runner: ProtectCheckRunnerState;
};

export const ProtectCheckCard = ({ flow, runner }: ProtectCheckCardProps) => {
  const controller = useProtectCheckCardController(runner);
  return (
    <ProtectCheckCardView
      flow={flow}
      {...controller}
    />
  );
};
