import { isVersionCompatible, type VersionBounds } from '@clerk/shared/versionCheck';
import React from 'react';

export {
  checkVersionAgainstBounds,
  isVersionCompatible,
  parseVersion,
  type VersionBounds,
} from '@clerk/shared/versionCheck';

declare const __CLERK_UI_SUPPORTED_REACT_BOUNDS__: VersionBounds[];

/**
 * Checks if the host application's React version is compatible with @clerk/ui's shared variant.
 * The shared variant expects React to be provided via globalThis.__clerkSharedModules,
 * so we need to ensure the host's React version matches what @clerk/ui was built against.
 *
 * This function is evaluated once at module load time.
 */
function computeReactVersionCompatibility(): boolean {
  try {
    return isVersionCompatible(React.version, __CLERK_UI_SUPPORTED_REACT_BOUNDS__);
  } catch {
    // If we can't determine compatibility, fall back to non-shared variant
    return false;
  }
}

/**
 * Whether the host React version is compatible with the shared @clerk/ui variant.
 * This is computed once at module load time for optimal performance.
 */
export const IS_REACT_SHARED_VARIANT_COMPATIBLE = computeReactVersionCompatibility();
