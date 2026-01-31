import nextPkg from 'next/package.json';

function meetsNextMinimumVersion(minimumMajorVersion: number) {
  if (!nextPkg?.version) {
    return false;
  }

  const majorVersion = parseInt(nextPkg.version.split('.')[0], 10);
  return !isNaN(majorVersion) && majorVersion >= minimumMajorVersion;
}

const isNext13 = nextPkg?.version?.startsWith('13.') ?? false;

/**
 * Those versions are affected by a bundling issue that will break the application if `node:fs` is used inside a server function.
 * The affected versions are >=next@13.5.4 and <=next@14.0.4
 */
const isNextWithUnstableServerActions = isNext13 || (nextPkg?.version?.startsWith('14.0') ?? false);

/**
 * Next.js 16+ supports proxy.ts (Node.js runtime) as an alternative to middleware.ts (Edge runtime)
 */
const isNext16OrHigher = meetsNextMinimumVersion(16);

/**
 * Display name for middleware/proxy file references in error messages
 */
export const middlewareFileReference = isNext16OrHigher ? 'middleware or proxy' : 'middleware';

export { isNext13, isNextWithUnstableServerActions, isNext16OrHigher };
