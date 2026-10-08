import type { __internal_ProtectCheckModalProps } from '@clerk/shared/types';

import { withCardStateProvider } from '@/ui/elements/contexts';

import { useProtectCheckRunner } from '../../hooks/useProtectCheckRunner';
import { ProtectCheckCard } from '../ProtectCheck/ProtectCheckCard';
import { useProtectCheckModalController } from './protect-check-modal.controller';
import type { ProtectCheckModalModel } from './protect-check-modal.model';
import { useProtectCheckModalModel } from './protect-check-modal.model';
import { ProtectCheckModalView } from './protect-check-modal.view';

function ProtectCheckModalCardContent({ model }: { model: ProtectCheckModalModel }) {
  const runner = useProtectCheckRunner(model.runner, model.config);
  return (
    <ProtectCheckCard
      flow={model.flow}
      runner={runner}
    />
  );
}

const ProtectCheckModalCard = withCardStateProvider(ProtectCheckModalCardContent);

function ProtectCheckModal(props: __internal_ProtectCheckModalProps): JSX.Element | null {
  const model = useProtectCheckModalModel(props);
  const controller = useProtectCheckModalController(model);

  if (!controller.show) {
    return null;
  }

  return (
    <ProtectCheckModalView>
      <ProtectCheckModalCard model={model} />
    </ProtectCheckModalView>
  );
}

ProtectCheckModal.displayName = 'ProtectCheckModal';

export { ProtectCheckModal };
