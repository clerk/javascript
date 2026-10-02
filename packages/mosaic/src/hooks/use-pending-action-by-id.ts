import { useRef, useState } from 'react';

import type { ErrorDescription } from '../localization';
import { useErrorText } from '../localization';
import { toLocalizableError } from '../utils/errors';

export function usePendingActionById(fallbackMessage: string) {
  const errorText = useErrorText();
  const [pendingId, setPendingId] = useState<string>();
  const [errors, setErrors] = useState<Record<string, ErrorDescription>>({});
  const inFlight = useRef(false);

  const run = async (id: string, action: () => Promise<unknown>): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setPendingId(id);
    setErrors(({ [id]: _previous, ...rest }) => rest);
    try {
      await action();
      return true;
    } catch (error) {
      setErrors(current => ({ ...current, [id]: toLocalizableError(error) }));
      return false;
    } finally {
      inFlight.current = false;
      setPendingId(undefined);
    }
  };

  const messages = Object.fromEntries(Object.entries(errors).map(([id, error]) => [id, errorText(error, fallbackMessage)]));
  return { pendingId, errors: messages, busy: () => inFlight.current, run };
}
