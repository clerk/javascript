/* eslint-disable turbo/no-undeclared-env-vars */
import { resolve } from 'node:path';

import fs from 'fs-extra';

import { environmentConfig } from '../models/environment.js';

const getInstanceKeys = () => {
  let keys: Record<string, { pk: string; sk: string }>;
  try {
    keys = process.env.INTEGRATION_INSTANCE_KEYS
      ? JSON.parse(process.env.INTEGRATION_INSTANCE_KEYS)
      : fs.readJSONSync(resolve(__dirname, '..', '.keys.json')) || null;
  } catch (e) {
    console.log('Could not find .keys.json file', e);
  }
  if (!keys) {
    throw new Error('Missing instance keys. Is your env or .keys.json file populated?');
  }
  return keys;
};

const envKeys = getInstanceKeys();

const withEmailCodes = environmentConfig()
  .setId('withEmailCodes')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-email-codes'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-email-codes'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS', process.env.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withEmailLinks = environmentConfig()
  .setId('withEmailLinks')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-email-links'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-email-links'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS', process.env.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

export const envs = {
  withEmailCodes,
  withEmailLinks,
} as const;
