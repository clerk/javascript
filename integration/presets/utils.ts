/**
 * Returns a version specifier for a local Clerk package.
 *
 * Requires pkglab to be running with packages published.
 * Run: pkglab pub
 */
export function linkPackage(_pkg: string) {
  return '*';
}
