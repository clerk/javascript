import { type ReverificationController, useReverificationController } from './reverification.controller';
import { useReverificationModel } from './reverification.model';
import { ReverificationPending, ReverificationUnavailable, ReverificationView } from './reverification.view';
import {
  type ReverificationFetcher,
  useReverificationWithState,
  type UseReverificationWithStateOptions,
  type UseReverificationWithStateResult,
} from './use-reverification-with-state';

export type UseReverificationFlowResult<F extends ReverificationFetcher = ReverificationFetcher> = readonly [
  UseReverificationWithStateResult<F>[0],
  ReverificationController,
];

export function useReverificationFlow<F extends ReverificationFetcher = ReverificationFetcher>(
  fetcher: F,
  options?: UseReverificationWithStateOptions,
): UseReverificationFlowResult<F> {
  const [wrappedFetcher, reverificationState] = useReverificationWithState(fetcher, options);
  const model = useReverificationModel(reverificationState);
  const controller = useReverificationController(model);

  return [wrappedFetcher, controller];
}

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
