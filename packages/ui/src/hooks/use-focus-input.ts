import * as React from 'react';

/**
 * Programmatically set focus to an input element.
 *
 * @example
 * import { useFocusInput } from '~/hooks/use-focus-input';
 *
 * function Example() {
 *   const [ref, setFocus] = useInputFocus()
 *   return (
 *     <>
 *       <button onClick={() => setFocus()}>Focus</button>
 *       <input ref={ref} />
 *     </>
 *   )
 * }
 */

export function useFocusInput(): [React.RefObject<HTMLInputElement>, () => void] {
  const ref = React.useRef<HTMLInputElement>(null);
  const setFocus = React.useCallback(() => {
    // Using requestAnimationFrame to ensure the focus is set after the browser has painted,
    // which helps avoid potential issues with focus not being applied correctly.
    requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.focus();
      }
    });
  }, [ref]);
  return [ref, setFocus];
}
