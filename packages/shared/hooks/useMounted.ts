import React from 'react';

export function useMounted() {
  const componentIsMounted = React.useRef(false);

  React.useEffect(() => {
    componentIsMounted.current = true;

    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  return componentIsMounted;
}
