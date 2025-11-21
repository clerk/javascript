import { resolve } from 'node:path';

import fs from 'fs-extra';

import { constants } from '../constants';
import { environmentConfig } from '../models/environment';

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
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', true)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');

const withKeyless = base
  .clone()
  // Creates keyless applications in our staging database.
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', false);

const withEmailCodes = base
  .clone()
  .setId('withEmailCodes')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-codes').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-codes').pk)
  .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key');

const sessionsProd1 = base
  .clone()
  .setId('sessionsProd1')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('sessions-prod-1').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('sessions-prod-1').pk)
  .setEnvVariable('public', 'CLERK_JS_URL', '');

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

const withReverification = base
  .clone()
  .setId('withReverification')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-reverification').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-reverification').pk)
  .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key');

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

const withRestrictedMode = withEmailCodes
  .clone()
  .setId('withRestrictedMode')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-restricted-mode').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-restricted-mode').pk);

const withLegalConsent = base
  .clone()
  .setId('withLegalConsent')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-legal-consent').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-legal-consent').pk);

const withWaitlistdMode = withEmailCodes
  .clone()
  .setId('withWaitlistdMode')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-waitlist-mode').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-waitlist-mode').pk);

const withSignInOrUpFlow = withEmailCodes
  .clone()
  .setId('withSignInOrUpFlow')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined);

const withSignInOrUpEmailLinksFlow = withEmailLinks
  .clone()
  .setId('withSignInOrUpEmailLinksFlow')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined);

const withSignInOrUpwithRestrictedModeFlow = withEmailCodes
  .clone()
  .setId('withSignInOrUpwithRestrictedModeFlow')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-restricted-mode').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-restricted-mode').pk)
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined);

const withSessionTasks = base
  .clone()
  .setId('withSessionTasks')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-session-tasks').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-session-tasks').pk)
  .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key');

const withBillingJwtV2 = base
  .clone()
  .setId('withBillingJwtV2')
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing-staging').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing-staging').pk);

const withBilling = base
  .clone()
  .setId('withBilling')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing').pk);

const withWhatsappPhoneCode = base
  .clone()
  .setId('withWhatsappPhoneCode')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-whatsapp-phone-code').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-whatsapp-phone-code').pk);

const withAPIKeys = base
  .clone()
  .setId('withAPIKeys')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-api-keys').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-api-keys').pk);

const withProtectService = base
  .clone()
  .setId('withProtectService')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-protect-service').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-protect-service').pk);

export const envs = {
  base,
  sessionsProd1,
  withAPIKeys,
  withAPCore1ClerkLatest,
  withAPCore1ClerkV4,
  withAPCore2ClerkLatest,
  withAPCore2ClerkV4,
  withBilling,
  withBillingJwtV2,
  withCustomRoles,
  withDynamicKeys,
  withEmailCodes,
  withEmailCodes_destroy_client,
  withEmailCodesQuickstart,
  withEmailLinks,
  withKeyless,
  withLegalConsent,
  withRestrictedMode,
  withReverification,
  withSessionTasks,
  withSignInOrUpEmailLinksFlow,
  withSignInOrUpFlow,
  withSignInOrUpwithRestrictedModeFlow,
  withWaitlistdMode,
  withWhatsappPhoneCode,
  withProtectService,
} as const;
