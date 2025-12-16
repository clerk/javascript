import path from 'node:path';

export function linkPackage(pkg: string, tag?: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.CI === 'true') {
    const tarballsDir = process.env.E2E_CLERK_TARBALLS_DIR;
    if (tarballsDir) {
      // Resolve tarball by prefix so we don't need package.json versions to be snapshotted in every CI job.
      // e.g. packages/shared -> clerk-shared-<version>.tgz
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('node:fs');
      const prefix = `clerk-${pkg}-`;
      const entries = fs.readdirSync(tarballsDir);
      const match = entries.find((f: string) => f.startsWith(prefix) && f.endsWith('.tgz'));
      if (!match) {
        throw new Error(`Missing tarball for "${pkg}" in ${tarballsDir}`);
      }
      return `file:${path.resolve(tarballsDir, match)}`;
    }

    // In CI, use '*' to get the latest version from Verdaccio
    // which will be the snapshot version we just published
    return '*';
  }

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}
