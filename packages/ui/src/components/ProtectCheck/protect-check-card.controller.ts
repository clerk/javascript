import { useSpinDelay } from '../../hooks';
import type { ProtectCheckRunnerState } from '../../hooks/useProtectCheckRunner';

export const useProtectCheckCardController = (runner: ProtectCheckRunnerState) => {
  const { containerRef, isRunning, isWidgetVisible, error, retry } = runner;

  // Debounce the spinner's entrance so a near-instant check (or a script that signals its
  // widget immediately) never flashes it — the card header alone carries the first ~300ms.
  // The error and widget-visibility gates stay OUTSIDE the delay hook below: its minimum
  // visible duration must never outrank the handshake's "spinner is gone when the promise
  // resolves" guarantee, nor keep a spinner next to the retry button.
  const showSpinner = useSpinDelay(isRunning, { delay: 300 });

  return {
    containerRef,
    isRunning,
    isWidgetVisible,
    error,
    retry,
    showSpinner: showSpinner && !error && !isWidgetVisible,
  };
};
