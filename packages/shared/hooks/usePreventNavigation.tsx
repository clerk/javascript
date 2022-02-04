import React from 'react';

export function usePreventNavigation(defaultState = true) {
  const isEnabled = React.useRef(defaultState);

  React.useEffect(() => {
    window.onbeforeunload = () => {
      return isEnabled.current ? true : undefined;
    };
  }, []);

  const setPreventNavigationState = (s: boolean) => {
    isEnabled.current = s;
  };

  return { setPreventNavigationState };
}
