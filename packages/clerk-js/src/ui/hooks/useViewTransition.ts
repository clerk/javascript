import { useCallback } from 'react';

/**
 * Hook for managing CSS View Transitions in Clerk components
 * Provides utilities to trigger view transitions with proper fallbacks
 */
export const useViewTransition = () => {
  /**
   * Executes a callback within a view transition if supported
   * Falls back to immediate execution if View Transitions are not supported
   */
  const withViewTransition = useCallback(async (callback: () => void | Promise<void>): Promise<void> => {
    if ('startViewTransition' in document) {
      const transition = (document as any).startViewTransition(callback);
      return transition.finished;
    } else {
      // Fallback for browsers without View Transition API support
      await callback();
    }
  }, []);

  /**
   * Checks if View Transitions are supported in the current browser
   */
  const isViewTransitionSupported = useCallback((): boolean => {
    return 'startViewTransition' in document;
  }, []);

  /**
   * Creates a view transition with custom transition names
   * Useful for animating specific elements with unique transition names
   */
  const withNamedViewTransition = useCallback(
    async (callback: () => void | Promise<void>, transitionName: string, element?: HTMLElement): Promise<void> => {
      if (!isViewTransitionSupported()) {
        await callback();
        return;
      }

      // Set the view-transition-name on the element if provided
      const originalTransitionName = element?.style.viewTransitionName;
      if (element) {
        element.style.viewTransitionName = transitionName;
      }

      try {
        const transition = (document as any).startViewTransition(callback);
        await transition.finished;
      } finally {
        // Restore original transition name
        if (element) {
          if (originalTransitionName) {
            element.style.viewTransitionName = originalTransitionName;
          } else {
            element.style.removeProperty('view-transition-name');
          }
        }
      }
    },
    [isViewTransitionSupported],
  );

  return {
    withViewTransition,
    withNamedViewTransition,
    isViewTransitionSupported,
  };
};
