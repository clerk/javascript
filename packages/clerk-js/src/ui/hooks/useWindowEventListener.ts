import React from 'react';
type EventType = keyof WindowEventMap;

export const useWindowEventListener = (eventOrEvents: EventType | EventType[] | undefined, cb: () => void): void => {
  React.useEffect(() => {
    const events = [eventOrEvents].flat().filter(x => !!x);
    if (!events.length) {
      return;
    }
    events.forEach(e => window.addEventListener(e, cb));
    return () => {
      events.forEach(e => window.removeEventListener(e, cb));
    };
  }, [eventOrEvents, cb]);
};
