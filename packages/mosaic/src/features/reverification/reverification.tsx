import { Card } from '../../components/card';
import { useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import type { ReverificationProps } from './reverification.types';
import { ReverificationPending, ReverificationUnavailable, ReverificationView } from './reverification.view';

export function Reverification({ embedded = false, ...props }: ReverificationProps & { embedded?: boolean }) {
  const model = useReverificationModel(props);
  const controller = useReverificationController(model);

  if (controller.status === 'idle') {
    return null;
  }

  let content: JSX.Element;
  if (controller.status === 'loading') {
    content = <ReverificationPending />;
  } else if (controller.status === 'unavailable') {
    content = <ReverificationUnavailable />;
  } else {
    const { status: _status, ...viewProps } = controller;
    content = (
      <ReverificationView
        {...viewProps}
        // When rendering the view standalone for swingset or otherwise, you might want
        // to render it as embedded or not, but when rendering it through this wrapper,
        // the wrapper owns the <Card.Root> and the view is always acts as embedded
        embedded
      />
    );
  }

  if (embedded) {
    return content;
  }

  return <Card.Root renderBranding={false}>{content}</Card.Root>;
}
