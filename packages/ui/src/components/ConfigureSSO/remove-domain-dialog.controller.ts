import { useEffect, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

export const useRemoveDomainDialogController = (
  onRemove: () => Promise<unknown>,
  onClose: () => void,
  canRun: () => boolean,
) => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<object | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = null;
    };
  }, []);

  const onSubmit = async () => {
    if (!mounted.current || pending.current || !canRun()) {
      return;
    }
    const request = {};
    pending.current = request;
    card.setError(undefined);
    try {
      await onRemove();
      if (mounted.current && pending.current === request && canRun()) {
        onClose();
      }
    } catch (err) {
      if (mounted.current && pending.current === request && canRun()) {
        handleError(err as Error, [], card.setError);
      }
    } finally {
      if (pending.current === request) {
        pending.current = null;
      }
    }
  };
  return { onSubmit };
};
