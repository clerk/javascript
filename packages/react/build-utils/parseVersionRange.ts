import type { VersionBounds } from '@clerk/shared/versionCheck';
import { coerce } from 'semver';

export type { VersionBounds } from '@clerk/shared/versionCheck';

/**
 * Parses a semver range string (e.g., "^18.0.0 || ~19.0.3") into version bounds.
 *
 * Supported formats:
 * - Caret ranges: ^X.Y.Z - allows any version >= X.Y.Z and < (X+1).0.0
 * - Tilde ranges: ~X.Y.Z - allows any version >= X.Y.Z and < X.(Y+1).0
 * - Exact versions: X.Y.Z - treated as caret range
 * - OR combinations: "^18.0.0 || ~19.0.3" - multiple ranges separated by ||
 *
 * @param rangeStr - The semver range string to parse
 * @returns Array of version bounds, one per range component
 */
export function parseRangeToBounds(rangeStr: string): VersionBounds[] {
  const bounds: VersionBounds[] = [];
  const parts = rangeStr.split('||').map(s => s.trim());

  for (const part of parts) {
    if (part.startsWith('^')) {
      // Caret range: ^X.Y.Z means >= X.Y.Z and < (X+1).0.0
      const ver = coerce(part.slice(1));
      if (ver) {
        bounds.push([ver.major, ver.minor, -1, ver.patch]);
      }
    } else if (part.startsWith('~')) {
      // Tilde range: ~X.Y.Z means >= X.Y.Z and < X.(Y+1).0
      const ver = coerce(part.slice(1));
      if (ver) {
        bounds.push([ver.major, ver.minor, ver.minor, ver.patch]);
      }
    } else {
      // Exact version or other format - try to parse as caret
      const ver = coerce(part);
      if (ver) {
        bounds.push([ver.major, ver.minor, -1, ver.patch]);
      }
    }
  }

  return bounds;
}
