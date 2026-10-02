import { useRef, useState } from 'react';

export function usePendingAction(fallbackMessage: string) {
  const [pendingId, setPendingId] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      setErrors(current => ({
        ...current,
        [id]: error instanceof Error && error.message ? error.message : fallbackMessage,
      }));
      return false;
    } finally {
      inFlight.current = false;
      setPendingId(undefined);
    }
  };

  return { pendingId, errors, busy: () => inFlight.current, run };
}
