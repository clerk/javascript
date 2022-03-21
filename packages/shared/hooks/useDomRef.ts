import React from 'react';

export function useDomRef(querySelector?: string): React.MutableRefObject<HTMLElement | null> {
  const root = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    root.current = querySelector ? document.querySelector(querySelector) : null;
  }, []);

  return root;
}
