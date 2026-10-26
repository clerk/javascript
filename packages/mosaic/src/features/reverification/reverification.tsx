import type { Ref } from 'react';
import { useState } from 'react';

import { type ReverificationController, useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import { ReverificationError, ReverificationPending, ReverificationView } from './reverification.view';
import {
  type ReverificationFetcher,
  useReverificationWithState,
  type UseReverificationWithStateResult,
} from './use-reverification-with-state';

export type UseReverificationFlowResult<F extends ReverificationFetcher = ReverificationFetcher> = readonly [
  UseReverificationWithStateResult<F>[0],
  ReverificationController,
];

export function useReverificationFlow<F extends ReverificationFetcher = ReverificationFetcher>(
  fetcher: F,
): UseReverificationFlowResult<F> {
  const [wrappedFetcher, reverificationState] = useReverificationWithState(fetcher);
  const model = useReverificationModel(reverificationState);
  const controller = useReverificationController(model);

  return [wrappedFetcher, controller];
}

export interface ReverificationProps {
  controller: ReverificationController;
  onClose?: () => void;
  initialFocusRef?: Ref<HTMLElement>;
}

function held(controller: ReverificationController): ReverificationController {
  switch (controller.status) {
    case 'ready':
      return { ...controller, onCancel: undefined, isPending: true };
    case 'loading':
    case 'error':
      return { ...controller, onCancel: undefined };
    case 'retrying':
    case 'idle':
      return controller;
  }
}

export function Reverification({ controller, onClose, initialFocusRef }: ReverificationProps) {
  const [lastShown, setLastShown] = useState<ReverificationController | null>(null);
  // Reverification controller is memoized, but even if that breaks, this
  // component still only does a cheap immediate re-render and then continues
  if (controller.status !== 'idle' && controller !== lastShown) {
    setLastShown(controller);
  }
  const shown = controller.status === 'idle' ? (lastShown ? held(lastShown) : null) : controller;

  if (!shown || shown.status === 'idle') {
    return null;
  }

  if (shown.status === 'loading') {
    return <ReverificationPending />;
  } else if (shown.status === 'error') {
    return (
      <ReverificationError
        reason={shown.reason}
        onClose={shown.onCancel ? (onClose ?? shown.onCancel) : undefined}
      />
    );
  }

  return (
    <ReverificationView
      {...shown}
      focusRef={initialFocusRef}
    />
  );
}
