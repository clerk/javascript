import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationProps } from './reverification.types';
import { ReverificationPending, ReverificationUnavailable, ReverificationView } from './reverification.view';

export function Reverification(props: ReverificationProps) {
  const model = useReverificationModel(props);
  const controller = useReverificationController(model);

  if (controller.status === 'idle') {
    return null;
  }

  if (controller.status === 'loading') {
    return <ReverificationPending />;
  } else if (controller.status === 'unavailable') {
    return <ReverificationUnavailable />;
  }

  const { status: _status, ...viewProps } = controller;
  return <ReverificationView {...viewProps} />;
}
