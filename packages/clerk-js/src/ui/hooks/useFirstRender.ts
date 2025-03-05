import { useEffect, useState } from 'react';

/**
 * Custom hook that returns true if the component is rendering for the first time
 * and false for all subsequent renders.
 *
 * @returns {boolean} True for the first render, false afterwards
 */
export function useFirstRender() {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return isFirstRender;
}
