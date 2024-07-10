import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { parse } from 'dotenv';

import { applyCodemod } from '../codemods/index.js';
import { getClerkPackages } from '../utils/getClerkPackages.js';
import { getConfiguration } from '../utils/getConfiguration.js';
import { getDependencies } from '../utils/getDependencies.js';

/**
 *
 * @param {string} filename
 * @returns
 */
function hasFile(filename) {
  return existsSync(join(process.cwd(), filename));
}

/**
 *
 * @param {Record<string, string> | undefined} packages
 * @param {string} dependency
 * @returns
 */
function hasPackage(packages, dependency) {
  if (!packages) {
    return false;
  }
  return dependency in packages;
}

async function detectFramework() {
  const { dependencies, devDependencies } = await getDependencies(join(process.cwd(), 'package.json'));

  const IS_NEXT = hasFile('next.config.js') || hasFile('next.config.mjs');
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
 *
 * @param {import('../utils/getConfiguration.js').Configuration} configuration
 * @returns
 */
async function getInstanceConfiguration(configuration) {
  const { activeInstance, instances } = configuration;
  return instances[activeInstance];
}

/**
 *
 * @param {Record<string, string>} envConfiguration
 * @returns
 */
function buildEnvFile(envConfiguration) {
  return (
    Object.entries(envConfiguration)
      .map(([key, value]) => [key, JSON.stringify(value)].join('='))
      .join('\n') + '\n'
  );
}

/**
 *
 * @param {string} filename
 * @returns
 */
async function readEnvFile(filename) {
  const contents = await readFile(filename, 'utf-8');
  const envConfig = parse(contents);
  return envConfig;
}

/**
 * @returns {Promise<void>}
 */
async function linkDependencies() {
  const { dependencies } = await getDependencies(join(process.cwd(), 'package.json'));
  if (!dependencies) {
    throw new Error('you have no dependencies');
  }
  const clerkPackages = await getClerkPackages();

  const dependenciesToBeInstalled = Object.keys(dependencies)
    .filter(dep => dep in clerkPackages)
    .map(clerkDep => clerkPackages[clerkDep]);

  const args = ['install', '--no-audit', '--no-fund', ...dependenciesToBeInstalled];

  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1',
      },
    });

    child.on('close', code => {
      if (code !== 0) {
        reject();
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
 */
export async function setup({ js = true }) {
  console.log('Installing monorepo versions of Clerk packages from package.json...');
  await linkDependencies();

  const config = await getConfiguration();
  const instance = await getInstanceConfiguration(config);

  const framework = await detectFramework();
  switch (framework) {
    case 'nextjs': {
      console.log('Next.js detected, writing environment variables to .env.local...');
      const existingEnv = await readEnvFile('.env.local');
      await writeFile(
        join(process.cwd(), '.env.local'),
        buildEnvFile({
          ...existingEnv,
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
          CLERK_SECRET_KEY: instance.secretKey,
          ...(js ? { NEXT_PUBLIC_CLERK_JS_URL: 'http://localhost:4000/npm/clerk.browser.js' } : {}),
        }),
      );
      break;
    }
    case 'remix': {
      console.log('Remix detected, writing environment variables to .env...');
      const existingEnv = await readEnvFile('.env');
      await writeFile(
        join(process.cwd(), '.env'),
        buildEnvFile({
          ...existingEnv,
          CLERK_PUBLISHABLE_KEY: instance.publishableKey,
          CLERK_SECRET_KEY: instance.secretKey,
        }),
      );
      break;
    }
    case 'vite': {
      console.log('Vite detected, writing environment variables to .env...');
      const existingEnv = await readEnvFile('.env');
      await writeFile(
        join(process.cwd(), '.env'),
        buildEnvFile({
          ...existingEnv,
          VITE_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
        }),
      );

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
