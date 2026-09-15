import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationProps } from './reverification.types';
import { ReverificationView } from './reverification.view';

export function Reverification(props: ReverificationProps) {
  const model = useReverificationModel(props);
  const controller = useReverificationController(model);

  if (!props.isActive) {
    return null;
  }

  if (controller.status !== 'ready') {
    // TODO: Implement unavailable and loading states, could also live in the .view.
    return null;
  }

  const { status: _status, ...viewProps } = controller;
  return <ReverificationView {...viewProps} />;
}
