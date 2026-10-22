import { useEffect, useRef, useState } from 'react';

import { useAppVersionSupport } from '../hooks/useAppVersionSupport';

type LoadableClerk = { status?: string } | null;

export function useClerkRestartWhenSupported(clerk: LoadableClerk, discardClerk: () => void): number {
  const { isSupported } = useAppVersionSupport();
  const [restarts, setRestarts] = useState(0);
  const wasUnsupported = useRef(false);

  useEffect(() => {
    if (!isSupported) {
      wasUnsupported.current = true;
      return;
    }
    const failedToLoadWhileUnsupported = wasUnsupported.current && clerk?.status === 'error';
    wasUnsupported.current = false;
    if (failedToLoadWhileUnsupported) {
      discardClerk();
      setRestarts(count => count + 1);
    }
  }, [isSupported, clerk, discardClerk]);

  return restarts;
}
