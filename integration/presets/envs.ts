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
  .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY);

const withEmailLinks = base
  .clone()
  .setId('withEmailLinks')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-links').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-links').pk);

const withCustomRoles = base
  .clone()
  .setId('withCustomRoles')
  // Temporarily use the stage api until the custom roles feature is released to prod
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-custom-roles').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-custom-roles').pk);

const withEmailCodesQuickstart = withEmailCodes
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

// TODO: Delete
const multipleAppsSameDomainProd1 = environmentConfig()
  .setId('multipleAppsSameDomainProd1')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
  // TODO: Remove this once the apps are deployed
  .setEnvVariable('public', 'CLERK_API_URL', 'https://api.lclclerk.com')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('sessions-prod-1').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('sessions-prod-1').pk);

// TODO: Delete
const multipleAppsSameDomainProd2 = environmentConfig()
  .setId('multipleAppsSameDomainProd2')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
  // TODO: Remove this once the apps are deployed
  .setEnvVariable('public', 'CLERK_API_URL', 'https://api.lclclerk.com')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('sessions-prod-2').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('sessions-prod-2').pk);

const withDynamicKeys = withEmailCodes
  .clone()
  .setId('withDynamicKeys')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', '')
  .setEnvVariable('private', 'CLERK_DYNAMIC_SECRET_KEY', instanceKeys.get('with-email-codes').sk);

export const envs = {
  base,
  withEmailCodes,
  withEmailLinks,
  withCustomRoles,
  withEmailCodesQuickstart,
  withAPCore1ClerkLatest,
  withAPCore1ClerkV4,
  withAPCore2ClerkLatest,
  withAPCore2ClerkV4,
  multipleAppsSameDomainProd1,
  multipleAppsSameDomainProd2,
  withDynamicKeys,
} as const;
