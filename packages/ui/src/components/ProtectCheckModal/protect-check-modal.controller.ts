import { useEffect, useRef } from 'react';

import type { ProtectCheckModalModel } from './protect-check-modal.model';

export function useProtectCheckModalController(model: ProtectCheckModalModel) {
  const isClearOnMount = useRef(!model.hasChallenge).current;
  const didReportClear = useRef(false);
  const { onResolvedClear } = model;

  useEffect(() => {
    if (isClearOnMount && !didReportClear.current) {
      didReportClear.current = true;
      onResolvedClear();
    }
  }, [isClearOnMount, onResolvedClear]);

  return { show: !isClearOnMount };
}
