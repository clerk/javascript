import { useEffect, useState } from 'react';

export function useDelayedVisibility<T>(valueToDelay: T, delayInMs: number) {
  const [isVisible, setVisible] = useState<T | undefined>();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (valueToDelay && !isVisible) {
      // First time that valueToDelay has truthy value means we want to display it
      timeoutId = setTimeout(() => setVisible(valueToDelay), delayInMs);
    } else if (!valueToDelay && isVisible) {
      // valueToDelay has already a truthy value and becomes falsy means we want to hide it
      timeoutId = setTimeout(() => setVisible(undefined), delayInMs);
    } else {
      // it is already displayed, and we want immediate updates to that value
      setVisible(valueToDelay);
    }
    return () => clearTimeout(timeoutId);
  }, [valueToDelay, delayInMs, isVisible]);
  return isVisible;
}

export function useFieldMessageVisibility<T = string>(fieldMessage: T, delayInMs: number) {
  return useDelayedVisibility(fieldMessage, delayInMs);
}
