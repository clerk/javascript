import { inject } from 'vue';

import { PortalInjectionKey } from '../keys';

/**
 * Composable to get the current portal root container.
 * Returns the getContainer function from context if inside a PortalProvider,
 * otherwise returns a function that returns null (default behavior).
 */
export const usePortalRoot = (): (() => HTMLElement | null) => {
  const context = inject(PortalInjectionKey, null);

  if (context && context.getContainer) {
    return context.getContainer;
  }

  // Return a function that returns null when not inside a PortalProvider
  return () => null;
};
