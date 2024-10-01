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
  return new Map(Object.entries(keys));
};

export const instanceKeys = getInstanceKeys();

const base = environmentConfig()
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withEmailCodes = base
  .clone()
  .setId('withEmailCodes')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-codes').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-codes').pk)
  .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key');

const withEmailCodes_destroy_client = withEmailCodes
  .clone()
  .setEnvVariable('public', 'EXPERIMENTAL_PERSIST_CLIENT', 'false');

const withEmailLinks = base
  .clone()
  .setId('withEmailLinks')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-links').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-links').pk);

const withCustomRoles = base
  .clone()
  .setId('withCustomRoles')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-custom-roles').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-custom-roles').pk);

const withEmailCodesQuickstart = withEmailCodes
  .clone()
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '');

const withAPCore1ClerkLatest = environmentConfig()
  .setId('withAPCore1ClerkLatest')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-codes').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-codes').pk)
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withAPCore1ClerkV4 = environmentConfig()
  .setId('withAPCore1ClerkV4')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-codes').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-codes').pk);

const withAPCore2ClerkLatest = environmentConfig()
  .setId('withAPCore2ClerkLatest')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('core-2-all-enabled').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('core-2-all-enabled').pk)
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withAPCore2ClerkV4 = environmentConfig()
  .setId('withAPCore2ClerkV4')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('core-2-all-enabled').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('core-2-all-enabled').pk);

const withDynamicKeys = withEmailCodes
  .clone()
  .setId('withDynamicKeys')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', '')
  .setEnvVariable('private', 'CLERK_DYNAMIC_SECRET_KEY', instanceKeys.get('with-email-codes').sk);

export const envs = {
  base,
  withEmailCodes,
  withEmailCodes_destroy_client,
  withEmailLinks,
  withCustomRoles,
  withEmailCodesQuickstart,
  withAPCore1ClerkLatest,
  withAPCore1ClerkV4,
  withAPCore2ClerkLatest,
  withAPCore2ClerkV4,
  withDynamicKeys,
} as const;
