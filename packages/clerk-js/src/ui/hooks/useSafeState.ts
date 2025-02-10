import React from 'react';

/**
 * Solves/ hides the "setState on unmounted component" warning
 * In 99% of cases, there is no memory leak involved, but still an annoying warning
 * For more info:
 * https://github.com/reactwg/react-18/discussions/82
 */
export function useSafeState<S>(initialState: S | (() => S)): [S, React.Dispatch<React.SetStateAction<S>>];
export function useSafeState<S = undefined>(): [S | undefined, React.Dispatch<React.SetStateAction<S | undefined>>];
export function useSafeState<S>(initialState?: S | (() => S)) {
  const [state, _setState] = React.useState(initialState);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setState = React.useCallback((currentState: any) => {
    if (!isMountedRef.current) {
      return;
    }
    _setState(currentState);
  }, []);

  return [state, setState] as const;
}
