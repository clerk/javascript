import { useContext } from 'react';

import { PageContext } from './PageContext';

export function useRequirePage(componentName: string): boolean {
  const page = useContext(PageContext);
  if (!page) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(`${componentName} must be used inside a page component`);
    }
    return false;
  }
  return true;
}
