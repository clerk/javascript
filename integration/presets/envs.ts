/* eslint-disable turbo/no-undeclared-env-vars */
import { resolve } from 'node:path';

import fs from 'fs-extra';

import { environmentConfig } from '../models/environment.js';

const envKeys: Record<string, { pk: string; sk: string }> = process.env.INTEGRATION_INSTANCE_KEYS
  ? JSON.parse(process.env.INTEGRATION_INSTANCE_KEYS)
  : fs.readJSONSync(resolve(__dirname, '..', '.keys.json')) || null;

if (!envKeys) {
  throw new Error('Missing INTEGRATION_INSTANCE_KEYS environment variable. Is your env or .keys.json file populated?');
}

const withEmailCodes = environmentConfig()
  .setId('withEmailCodes')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['all-enabled'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['all-enabled'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up');

const withEmailLinks = environmentConfig()
  .setId('withEmailLinks')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-email-links'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-email-links'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up');

export const envs = {
  withEmailCodes,
  withEmailLinks,
} as const;
