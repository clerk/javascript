#!/usr/bin/env node

/*
  This script:

  1. Finds root package manifests plus electron-passkeys platform manifests.
  2. Excludes packages with "private": true.
  3. Reads each package’s name and current version.
  4. Requests: https://registry.npmjs.org/<package-name>/<version>
  5. Retries only versions that aren’t available yet.
*/

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'tinyglobby';

// Give npm ~10 minutes after the publish command to make the packages available, fail after that
// This is an arbitrarily chosen timeframe, we've seen ~6 minute delays, so 10 is just that + leeway
export const NPM_AVAILABILITY_MAX_ATTEMPTS = 60;
export const NPM_AVAILABILITY_DELAY_MS = 10_000;

const PACKAGE_MANIFEST_PATTERNS = ['packages/*/package.json', 'packages/electron-passkeys/npm/*/package.json'];

export async function getPublicPackages(patterns = PACKAGE_MANIFEST_PATTERNS) {
  const manifests = await glob(patterns);
  const packages = await Promise.all(
    manifests.map(async manifest => {
      const packageJson = JSON.parse(await readFile(manifest, 'utf8'));
      return packageJson.private ? undefined : { name: packageJson.name, version: packageJson.version };
    }),
  );

  return packages
    .filter(packageInfo => packageInfo?.name && packageInfo.version)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getUnavailablePackages(packages, fetchPackage = fetch) {
  const results = await Promise.all(
    packages.map(async packageInfo => {
      const url = `https://registry.npmjs.org/${packageInfo.name}/${packageInfo.version}`;

      try {
        const response = await fetchPackage(url);
        await response.body?.cancel();
        return response.ok ? undefined : { ...packageInfo, status: response.status };
      } catch (error) {
        return { ...packageInfo, error: error instanceof Error ? error.message : String(error) };
      }
    }),
  );

  return results.filter(Boolean);
}

export async function waitForPackagesOnNpm(
  packages,
  {
    fetchPackage = fetch,
    maxAttempts = NPM_AVAILABILITY_MAX_ATTEMPTS,
    delayMs = NPM_AVAILABILITY_DELAY_MS,
    sleep = duration => new Promise(resolvePromise => setTimeout(resolvePromise, duration)),
    log = console.log,
  } = {},
) {
  let unavailable = packages;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    unavailable = await getUnavailablePackages(unavailable, fetchPackage);

    if (unavailable.length === 0) {
      log(`All ${packages.length} public package versions are available on npm.`);
      return;
    }

    const versions = unavailable.map(packageInfo => `${packageInfo.name}@${packageInfo.version}`).join(', ');

    if (attempt < maxAttempts) {
      log(`Attempt ${attempt}/${maxAttempts}: waiting for ${versions}`);
      await sleep(delayMs);
    }
  }

  const versions = unavailable.map(packageInfo => `${packageInfo.name}@${packageInfo.version}`).join(', ');
  throw new Error(`Package versions did not become available on npm after ${maxAttempts} attempts: ${versions}`);
}

async function main() {
  const packages = await getPublicPackages();
  await waitForPackagesOnNpm(packages);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
