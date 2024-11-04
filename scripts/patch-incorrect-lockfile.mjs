//@ts-check

/**
 * This file adapted from Next.js' automatic SWC patching script.
 * https://github.com/vercel/next.js/blob/f771c6d78783684629c143329273b348990fcbe0/packages/next/src/lib/patch-incorrect-lockfile.ts
 */

import { spawn } from 'child_process';
import { promises } from 'fs';
import path from 'path';

import lockfileParsed from '../package-lock.json' with { type: 'json' };

const registry = 'https://registry.npmjs.org/';

/**
 * Run `npm install` a second time to trigger npm's lockfile formatting. This prevents an additional diff to the
 * lockfile when the install is run a second time.
 */
async function formatPkgLock() {
  return /** @type {Promise<void>} */ (
    new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install', '--package-lock-only'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
      });

      npm.on('close', code => {
        if (code === 0) {
          resolve();
        }
        reject(code);
      });
    })
  );
}

/** @typedef {Awaited<ReturnType<typeof fetchPkgInfo>>} PkgInfo */

/**
 *
 * @param {string} pkg
 * @param {string} version
 * @returns
 */
async function fetchPkgInfo(pkg, version) {
  // https://registry.npmjs.org/@rspack/binding-linux-x64-gnu
  const res = await fetch(`${registry}${pkg}/${version}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch registry info for ${pkg}, got status ${res.status}`);
  }
  const versionData = await res.json();

  return {
    version: versionData.version,
    os: versionData.os,
    cpu: versionData.cpu,
    engines: versionData.engines,
    tarball: versionData.dist.tarball,
    integrity: versionData.dist.integrity,
  };
}

/**
 * Attempts to patch npm package-lock.json when it
 * fails to include optionalDependencies for other platforms
 * this can occur when the package-lock is rebuilt from a current
 * node_modules install instead of pulling fresh package data
 */
async function patchIncorrectLockfile() {
  const expectedRspackPkgs = Object.entries(
    lockfileParsed['packages']['node_modules/@rspack/binding']['optionalDependencies'] || {},
  ).filter(([pkg]) => pkg.startsWith('@rspack/binding-'));

  /**
   *
   * @param {string} pkg
   * @param {PkgInfo} pkgData
   */
  const patchPackage = (pkg, pkgData) => {
    lockfileParsed.packages[pkg] = {
      version: pkgData.version,
      resolved: pkgData.tarball,
      integrity: pkgData.integrity,
      cpu: pkgData.cpu,
      optional: true,
      os: pkgData.os,
      engines: pkgData.engines,
    };
  };

  try {
    /** @type {[string, string][]} */
    const missingRspackPkgs = [];

    /** @type {string|undefined} */
    let pkgPrefix;

    pkgPrefix = '';
    for (const pkg of Object.keys(lockfileParsed.packages)) {
      if (pkg.endsWith('node_modules/@rspack/core')) {
        pkgPrefix = pkg.substring(0, pkg.length - 12);
      }
    }

    if (!pkgPrefix) {
      // unable to locate the next package so bail
      return;
    }

    for (const pkg of expectedRspackPkgs) {
      if (!lockfileParsed.packages[`${pkgPrefix}${pkg[0]}`]) {
        missingRspackPkgs.push(pkg);
      }
    }

    if (missingRspackPkgs.length === 0) {
      return;
    }
    console.warn(`Found lockfile missing swc dependencies,`, 'patching...');

    const pkgsData = await Promise.all(missingRspackPkgs.map(([pkg, version]) => fetchPkgInfo(pkg, version)));

    for (let i = 0; i < pkgsData.length; i++) {
      const pkg = missingRspackPkgs[i][0];
      const pkgData = pkgsData[i];

      patchPackage(`${pkgPrefix}${pkg}`, pkgData);
    }

    await promises.writeFile(path.join(process.cwd(), 'package-lock.json'), JSON.stringify(lockfileParsed, null, 2));
    console.warn(
      'Lockfile was successfully patched, please run "npm install" to ensure Rspack dependencies are downloaded',
    );
    await formatPkgLock();
  } catch (err) {
    console.error(`Failed to patch lockfile, please try uninstalling and reinstalling next in this workspace`);
    console.error(err);
  }
}

await patchIncorrectLockfile();
