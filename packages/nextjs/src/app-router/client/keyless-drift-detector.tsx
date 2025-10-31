import { useSelectedLayoutSegments } from 'next/navigation';
import { useEffect } from 'react';

import { canUseKeyless } from '../../utils/feature-flags';

export function KeylessDriftDetector() {
  const segments = useSelectedLayoutSegments();
  const isNotFoundRoute = segments[0]?.startsWith('/_not-found') || false;

  useEffect(() => {
    if (canUseKeyless && !isNotFoundRoute) {
      void import('../keyless-actions.js').then(m => m.detectKeylessEnvDriftAction());
    }
  }, [isNotFoundRoute]);

  return null;
}
