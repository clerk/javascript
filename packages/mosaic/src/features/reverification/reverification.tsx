import type { ReverificationController } from './reverification.controller';
import { ReverificationPending, ReverificationUnavailable, ReverificationView } from './reverification.view';

export function Reverification(controller: ReverificationController) {
  if (controller.status === 'idle') {
    return null;
  }

  if (controller.status === 'loading') {
    return <ReverificationPending />;
  } else if (controller.status === 'unavailable') {
    return <ReverificationUnavailable />;
  }

  return <ReverificationView {...controller} />;
}
