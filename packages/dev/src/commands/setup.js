import { existsSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

import { applyCodemod } from '../codemods/index.js';
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
      .map(([key, value]) => [key, value].join('='))
      .join('\n') + '\n'
  );
}

/**
 * Performs framework configuration tasks necessary for local development with the monorepo packages.
 */
export async function setup() {
  const config = await getConfiguration();
  const instance = await getInstanceConfiguration(config);

  const framework = await detectFramework();
  switch (framework) {
    case 'nextjs': {
      console.log('Next.js detected, writing environment variables to .env.local...');
      await appendFile(
        join(process.cwd(), '.env.local'),
        buildEnvFile({
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
          CLERK_SECRET_KEY: instance.secretKey,
          NEXT_PUBLIC_CLERK_JS_URL: 'http://localhost:4000/npm/clerk.browser.js',
        }),
      );
      break;
    }
    case 'remix': {
      console.log('Remix detected, writing environment variables to .env...');
      await appendFile(
        join(process.cwd(), '.env'),
        buildEnvFile({
          CLERK_PUBLISHABLE_KEY: instance.publishableKey,
          CLERK_SECRET_KEY: instance.secretKey,
        }),
      );
      break;
    }
    case 'vite': {
      console.log('Vite detected, writing environment variables to .env...');
      await appendFile(
        join(process.cwd(), '.env'),
        buildEnvFile({
          VITE_CLERK_PUBLISHABLE_KEY: instance.publishableKey,
        }),
      );

      console.log('Adding clerkJSUrl to ClerkProvider...');
      const res = await applyCodemod('add-clerkjsurl-to-provider.cjs', [process.cwd()]);
      if (res.ok === 0) {
        console.warn('warning: could not find a ClerkProvider to edit. Please add clerkJSUrl manually.');
      }
      break;
    }
    default: {
      throw new Error('unable to determine framework');
    }
  }
}
