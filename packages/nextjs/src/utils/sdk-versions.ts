import nextPkg from 'next/package.json';

function meetsNextMinimumVersion(minimumMajorVersion: number) {
  if (!nextPkg?.version) {
    return false;
  }

  const majorVersion = parseInt(nextPkg.version.split('.')[0], 10);
  return !isNaN(majorVersion) && majorVersion >= minimumMajorVersion;
}

/**
 * Next.js 16+ supports proxy.ts (Node.js runtime) as an alternative to middleware.ts (Edge runtime)
 */
export const isNext16OrHigher = meetsNextMinimumVersion(16);

/**
 * Display name for middleware/proxy file references in error messages
 */
export const middlewareFileReference = isNext16OrHigher ? 'middleware or proxy' : 'middleware';
