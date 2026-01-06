import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tarballCache = new Map<string, string>();

const PACKAGES_REQUIRING_TARBALL = ['astro'];

/**
 * Creates a tarball of a package and returns the file: protocol path to it.
 * This is needed for packages containing .astro files because Astro's Vite
 * plugin cannot properly resolve paths in symlinked packages.
 */
function createPackageTarball(pkg: string): string {
  if (tarballCache.has(pkg)) {
    return tarballCache.get(pkg);
  }

  const pkgPath = path.resolve(process.cwd(), `packages/${pkg}`);
  const tmpDir = path.join(os.tmpdir(), '.clerk-integration-tarballs');

  fs.mkdirSync(tmpDir, { recursive: true });

  const result = execSync('pnpm pack --pack-destination ' + tmpDir, {
    cwd: pkgPath,
    encoding: 'utf-8',
  });

  const tgzPath = result.trim().split('\n').pop();
  const tarballPath = `file:${tgzPath}`;

  tarballCache.set(pkg, tarballPath);
  return tarballPath;
}

export function linkPackage(pkg: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.CI === 'true') {
    // In CI, use '*' to get the latest version from Verdaccio
    // which will be the snapshot version we just published
    return '*';
  }

  // See: https://github.com/withastro/astro/issues/8312
  if (PACKAGES_REQUIRING_TARBALL.includes(pkg)) {
    return createPackageTarball(pkg);
  }

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}
