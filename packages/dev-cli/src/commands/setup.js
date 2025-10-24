import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path, { join } from 'node:path';

import { parse } from 'dotenv';

import { applyCodemod } from '../codemods/index.js';
import { INVALID_INSTANCE_KEYS_ERROR, NULL_ROOT_ERROR } from '../utils/errors.js';
import { getClerkPackages } from '../utils/getClerkPackages.js';
import { getConfiguration } from '../utils/getConfiguration.js';
import { getMonorepoRoot } from '../utils/getMonorepoRoot.js';
import { getPackageJSON } from '../utils/getPackageJSON.js';

/**
 * Returns `true` if the cwd contains a file named `filename`, otherwise returns `false`.
 * @param {string} filename
 * @returns {boolean}
 */
function hasFile(filename) {
  return existsSync(join(process.cwd(), filename));
}

/**
 * Returns `true` if `packages` contains a `dependency` key, otherwise `false`.
 * @param {Record<string, string> | undefined} packages
 * @param {string} dependency
 * @returns {boolean}
 */
function hasPackage(packages, dependency) {
  if (!packages) {
    return false;
  }
  return dependency in packages;
}

/**
 * Returns a string corresponding to the framework detected in the cwd.
 * @param {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string>}} pkgJSON
 * @returns {string}
 */
function detectFramework(pkgJSON) {
  const { dependencies, devDependencies } = pkgJSON;
  const IS_NEXT = hasPackage(dependencies, 'next');
  if (IS_NEXT) {
    return 'nextjs';
  }

  const IS_REMIX = hasFile('remix.config.js') || hasFile('remix.config.mjs');
  if (IS_REMIX) {
    return 'remix';
  }

  const IS_VITE = hasPackage(dependencies, 'vite') || hasPackage(devDependencies, 'vite');
  if (IS_VITE) {
    return 'vite';
  }

  throw new Error('unable to determine framework');
}

/**
 * Returns the output file tracing root for the current working directory.
 * @returns {Promise<string | null>}
 */
async function getOutputFileTracingRoot() {
  const monorepoRoot = await getMonorepoRoot();
  if (!monorepoRoot) {
    throw new Error(NULL_ROOT_ERROR);
  }
  const p1 = path.resolve(monorepoRoot);
  const p2 = path.resolve(process.cwd());

  const root1 = path.parse(p1).root;
  const root2 = path.parse(p2).root;

  if (root1 !== root2) {
    return null;
  }

  const parts1 = p1.slice(root1.length).split(path.sep);
  const parts2 = p2.slice(root2.length).split(path.sep);

  const len = Math.min(parts1.length, parts2.length);
  const common = [];
  for (let i = 0; i < len; i++) {
    if (parts1[i] === parts2[i]) {
      common.push(parts1[i]);
    } else {
      break;
    }
  }

  return common.length ? path.join(root1, ...common) : root1;
}

/**
 * Returns the active instance of the provided `configuration`.
 * @param {import('../utils/getConfiguration.js').Configuration} configuration
 * @returns {Promise<import('../utils/getConfiguration.js').InstanceConfiguration>}
 */
async function getInstanceConfiguration(configuration) {
  const { activeInstance, instances } = configuration;
  const activeInstanceConfig = instances[activeInstance];
  if (!activeInstanceConfig.publishableKey.startsWith('pk_') || !activeInstanceConfig.secretKey.startsWith('sk_')) {
    throw new Error(INVALID_INSTANCE_KEYS_ERROR);
  }
  return activeInstanceConfig;
}

/**
 * Generates a .env file string.
 * @param {Record<string, string>} envConfiguration
 * @returns {string}
 */
function buildEnvFile(envConfiguration) {
  return (
    Object.entries(envConfiguration)
      .map(([key, value]) => [key, JSON.stringify(value)].join('='))
      .join('\n') + '\n'
  );
}

/**
 * Parses the file at `filename` with dotenv.
 * @param {string} filename
 * @returns {Promise<import('dotenv').DotenvParseOutput>}
 */
async function readEnvFile(filename) {
  const contents = await readFile(filename, 'utf-8');
  const envConfig = parse(contents);
  return envConfig;
}

/**
 * Write the provided `config` to the .env file at `filename`, merging with any existing entries.
 * @param {string} filename
 * @param {Record<string, string>} config
 */
async function mergeEnvFiles(filename, config) {
  const envFileExists = hasFile(filename);
  const existingEnv = envFileExists ? await readEnvFile(filename) : {};
  await writeFile(
    join(process.cwd(), filename),
    buildEnvFile({
      ...existingEnv,
      ...config,
    }),
  );
}

/**
 * Checks if the current working directory contains a lockfile that can be imported with `pnpm import`
 * @returns {boolean}
 */
function hasSupportedLockfile() {
  const SUPPORTED_LOCKFILES = ['package-lock.json', 'yarn.lock'];
  for (const lockfile of SUPPORTED_LOCKFILES) {
    if (existsSync(join(process.cwd(), lockfile))) {
      return true;
    }
  }

  return false;
}

/**
 * Imports a compatible lockfile with `pnpm import` if present.
 * @returns {Promise<void>}
 */
async function importPackageLock() {
  return new Promise((resolve, reject) => {
    if (!hasSupportedLockfile()) {
      return resolve();
    }
    console.log('Supported non-pnpm lockfile detected, importing with `pnpm import`...');

    const child = spawn('pnpm', ['import'], {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error());
        return;
      }
      resolve();
    });
  });
}

/**
 * Installs the monorepo versions of the Clerk dependencies listed in the `package.json` file of the cwd.
 * @returns {Promise<void>}
 */
async function linkDependencies() {
  const { dependencies } = await getPackageJSON(join(process.cwd(), 'package.json'));
  if (!dependencies) {
    throw new Error('you have no dependencies');
  }
  const clerkPackages = await getClerkPackages();

  const dependenciesToBeInstalled = Object.keys(dependencies)
    .filter(dep => dep in clerkPackages)
    .map(clerkDep => clerkPackages[clerkDep]);

  const args = ['add', ...dependenciesToBeInstalled];

  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });

    child.on('close', code => {
      if (code !== 0) {
        reject(new Error());
        return;
      }
      resolve();
    });
  });
}

/**
 * Installs the monorepo-versions of Clerk dependencies listed in the `package.json` file of the current working
 * directory, and performs framework configuration tasks necessary for local development with the monorepo packages.
 * @param {object} args
 * @param {boolean | undefined} args.js If `false`, do not customize the clerkJSUrl.
 * @param {boolean | undefined} args.skipInstall If `true`, do not install monorepo versions of packages.
 */
export async function setup({ js = true, skipInstall = false }) {
  if (!skipInstall) {
    console.log('Installing monorepo versions of Clerk packages from package.json...');
    await importPackageLock();
    await linkDependencies();
  }

  const config = await getConfiguration();
  const instance = await getInstanceConfiguration(config);

  const pkgJSON = await getPackageJSON(join(process.cwd(), 'package.json'));

  const framework = detectFramework(pkgJSON);
  switch (framework) {
    case 'nextjs': {
      console.log('Next.js detected, writing environment variables to .env.local...');
      await mergeEnvFiles('.env.local', {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
        CLERK_SECRET_KEY: instance.secretKey,
        ...(js ? { NEXT_PUBLIC_CLERK_JS_URL: 'http://localhost:4000/npm/clerk.browser.js' } : {}),
      });

      if (pkgJSON.scripts?.dev && pkgJSON.scripts.dev.includes('--turbo')) {
        const outputFileTracingRoot = await getOutputFileTracingRoot();
        console.warn(
          `\n\x1b[43m\x1b[30m Heads up! \x1b[0m Your \`dev\` script is using Turbopack. You will need to set the \`outputFileTracingRoot\` in your \`next.config.mjs\` file to "${outputFileTracingRoot}".\n`,
        );
      }
      break;
    }
    case 'remix': {
      console.log('Remix detected, writing environment variables to .env...');
      await mergeEnvFiles('.env', {
        CLERK_PUBLISHABLE_KEY: instance.publishableKey,
        CLERK_SECRET_KEY: instance.secretKey,
      });
      break;
    }
    case 'vite': {
      console.log('Vite detected, writing environment variables to .env...');
      await mergeEnvFiles('.env', {
        VITE_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
      });

      if (js) {
        console.log('Adding clerkJSUrl to ClerkProvider...');
        const res = await applyCodemod('add-clerkjsurl-to-provider.cjs', [process.cwd()]);
        if (res.ok === 0) {
          console.warn('warning: could not find a ClerkProvider to edit. Please add clerkJSUrl manually.');
        }
      }
      break;
    }
    default: {
      throw new Error('unable to determine framework');
    }
  }
}
