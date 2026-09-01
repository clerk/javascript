import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationProps } from './reverification.types';

/**
 * Takes `ReverificationProps` and runs the local flow. Renders nothing until
 * the block view is wired to `ReverificationViewProps`.
 */
export function Reverification(props: ReverificationProps): null {
  const model = useReverificationModel(props);
  const ui = useReverificationController(model);

  if (!props.isActive || ui.status === 'idle') {
    return null;
  }

  return null;
}
