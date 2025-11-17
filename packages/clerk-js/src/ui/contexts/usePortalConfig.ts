import type { PortalProps } from '@clerk/shared/types';

import { usePortalContext } from './PortalContext';

/**
 * Hook to extract portal configuration from context as PortalProps.
 * Useful when you need to pass portal config to methods that accept PortalProps.
 *
 * @returns PortalProps object with portal configuration, or undefined if no config exists
 *
 * @example
 * ```tsx
 * const portalConfig = usePortalConfig();
 * openUserProfile({
 *   ...otherProps,
 *   ...portalConfig,
 * });
 * ```
 */
export const usePortalConfig = (): PortalProps | undefined => {
  const portalConfig = usePortalContext();

  if (!portalConfig) {
    return undefined;
  }

  return {
    disablePortal: portalConfig.disablePortal,
    portalId: portalConfig.portalId,
    portalRoot: portalConfig.portalRoot,
  };
};
