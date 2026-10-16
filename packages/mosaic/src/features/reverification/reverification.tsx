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
  const [wrappedFetcher, reverificationState, reset] = useReverificationWithState(fetcher);
  const model = useReverificationModel(reverificationState);
  const controller = useReverificationController(model, reset);

  return [wrappedFetcher, controller];
}

export type ReverificationProps = ReverificationController & {
  onClose?: () => void;
};

export function Reverification({ onClose, ...controller }: ReverificationProps) {
  if (controller.status === 'idle') {
    return null;
  }

  if (controller.status === 'loading') {
    return <ReverificationPending />;
  } else if (controller.status === 'error') {
    return (
      <ReverificationError
        reason={controller.reason}
        onClose={controller.onCancel ? (onClose ?? controller.onCancel) : undefined}
      />
    );
  }

  return <ReverificationView {...controller} />;
}
