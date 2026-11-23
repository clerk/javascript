import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { usePendingAction } from '../../../hooks/use-pending-action';
import type { SignUpProtectScreen } from '../sign-up.types';

export function useSignUpProtectController({ protect, onNext, expiredReloads }: SignUpProtectScreen) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const actions = usePendingAction<'challenge'>();

  const start = () =>
    void actions.run('challenge', async () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      container.replaceChildren();
      setIsWidgetVisible(false);
      onNext(
        await protect.resolve({
          container,
          expiredReloads,
          setWidgetVisible: visible => {
            flushSync(() => setIsWidgetVisible(visible));
            return Promise.resolve();
          },
        }),
      );
    });

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Each challenge runs once, when its screen mounts; the screen remounts for a new challenge, and Try again runs it again.
  }, []);

  return {
    containerRef,
    isWidgetVisible,
    isPending: actions.isPending,
    errorMessage: actions.error,
    onRetry: () => {
      expiredReloads.current = 0;
      start();
    },
  };
}
