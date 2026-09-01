import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationProps } from './reverification.types';
import { ReverificationView } from './reverification.view';

export function Reverification(props: ReverificationProps) {
  const model = useReverificationModel(props);
  const ui = useReverificationController(model);

  if (!props.isActive || ui.status !== 'ready') {
    return null;
  }

  const { status: _status, ...viewProps } = ui;
  return <ReverificationView {...viewProps} />;
}
