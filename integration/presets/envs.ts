import { resolve } from 'node:path';

import fs from 'fs-extra';

import { constants } from '../constants';
import { environmentConfig } from '../models/environment.js';

const getInstanceKeys = () => {
  let keys: Record<string, { pk: string; sk: string }>;
  try {
    keys = constants.INTEGRATION_INSTANCE_KEYS
      ? JSON.parse(constants.INTEGRATION_INSTANCE_KEYS)
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
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-email-codes'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-email-codes'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withEmailLinks = environmentConfig()
  .setId('withEmailLinks')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-email-links'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-email-links'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withCustomRoles = environmentConfig()
  .setId('withCustomRoles')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  // Temporarily use the stage api until the custom roles feature is released to prod
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-custom-roles'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-custom-roles'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withEmailCodesQuickstart = withEmailCodes
  .removeEnvVariable('public', 'CLERK_SIGN_IN_URL')
  .removeEnvVariable('public', 'CLERK_SIGN_UP_URL');

export const envs = {
  withEmailCodes,
  withEmailLinks,
  withCustomRoles,
  withEmailCodesQuickstart,
} as const;
