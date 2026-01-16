import React from 'react';

// Version bounds format: [major, minMinor, maxMinor, minPatch]
// - maxMinor === -1 means "any minor" (caret range, e.g., ^18.0.0)
// - maxMinor === minMinor means "same minor only" (tilde range, e.g., ~19.0.3)
export type VersionBounds = [major: number, minMinor: number, maxMinor: number, minPatch: number];

declare const __CLERK_UI_SUPPORTED_REACT_BOUNDS__: VersionBounds[];

/**
 * Parses a version string into major, minor, and patch numbers.
 * Returns null if the version string cannot be parsed.
 *
 * @example
 * parseVersion("18.3.1") // { major: 18, minor: 3, patch: 1 }
 * parseVersion("19.0.0-rc.1") // { major: 19, minor: 0, patch: 0 }
 * parseVersion("invalid") // null
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  const [, majorStr, minorStr, patchStr] = match;
  return {
    major: parseInt(majorStr, 10),
    minor: parseInt(minorStr, 10),
    patch: parseInt(patchStr, 10),
  };
}

/**
 * Checks if a parsed version satisfies the given version bounds.
 *
 * @param version - The parsed version to check
 * @param bounds - Array of version bounds to check against
 * @returns true if the version satisfies any of the bounds
 */
export function checkVersionAgainstBounds(
  version: { major: number; minor: number; patch: number },
  bounds: VersionBounds[],
): boolean {
  const { major, minor, patch } = version;

  return bounds.some(([bMajor, minMinor, maxMinor, minPatch]) => {
    if (major !== bMajor) {
      return false;
    }

    if (maxMinor === -1) {
      // Caret range: any minor >= minMinor, with patch check for minMinor
      return minor > minMinor || (minor === minMinor && patch >= minPatch);
    } else {
      // Tilde range: specific minor only
      return minor === maxMinor && patch >= minPatch;
    }
  });
}

/**
 * Checks if a version string is compatible with the given bounds.
 * This is a convenience function that combines parsing and checking.
 *
 * @param version - The version string to check (e.g., "18.3.1")
 * @param bounds - Array of version bounds to check against
 * @returns true if the version is compatible, false otherwise
 */
export function isVersionCompatible(version: string, bounds: VersionBounds[]): boolean {
  const parsed = parseVersion(version);
  if (!parsed) {
    return false;
  }
  return checkVersionAgainstBounds(parsed, bounds);
}

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
