import { resolve } from 'node:path';

import fs from 'fs-extra';

import { constants } from '../constants';
import type { EnvironmentConfig } from '../models/environment';
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

  // Merge staging keys if available
  try {
    const stagingKeys: Record<string, { pk: string; sk: string }> = constants.INTEGRATION_STAGING_INSTANCE_KEYS
      ? JSON.parse(constants.INTEGRATION_STAGING_INSTANCE_KEYS)
      : fs.readJSONSync(resolve(__dirname, '..', '.keys.staging.json')) || null;
    if (stagingKeys) {
      Object.assign(keys, stagingKeys);
    }
  } catch {
    // Staging keys are optional
  }

  return new Map(Object.entries(keys));
};

export const instanceKeys = getInstanceKeys();

const STAGING_API_URL = 'https://api.clerkstage.dev';
const STAGING_KEY_PREFIX = 'clerkstage-';

/**
 * Check whether an env config is ready for staging tests.
 * In non-staging mode, always returns true.
 * In staging mode, returns true only if the config has been swapped to staging keys
 * (indicated by CLERK_API_URL being set to the staging URL).
 */
export function isStagingReady(env: EnvironmentConfig): boolean {
  if (process.env.E2E_STAGING !== '1') return true;
  return env.privateVariables.get('CLERK_API_URL') === STAGING_API_URL;
}

/**
 * Sets PK/SK from the instance keys map and handles staging environment swapping.
 * When E2E_STAGING=1 is set, swaps PK/SK to staging keys (looked up as `clerkstage-<keyName>`)
 * and adds CLERK_API_URL. If the staging key doesn't exist, removes any inherited CLERK_API_URL
 * so the config falls back to production and is filtered from long-running apps by isStagingReady.
 * In non-staging mode, sets the production PK/SK and returns.
 */
function withInstanceKeys(keyName: string, env: EnvironmentConfig): EnvironmentConfig {
  const keys = instanceKeys.get(keyName)!;
  env.setEnvVariable('private', 'CLERK_SECRET_KEY', keys.sk).setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', keys.pk);

  if (process.env.E2E_STAGING !== '1') return env;

  const stagingKeyName = STAGING_KEY_PREFIX + keyName;
  if (!instanceKeys.has(stagingKeyName)) {
    // Remove staging API URL if inherited from parent clone to prevent
    // production keys from being used against the staging API
    env.privateVariables.delete('CLERK_API_URL');
    return env;
  }
  const stagingKeys = instanceKeys.get(stagingKeyName)!;
  return env
    .setEnvVariable('private', 'CLERK_SECRET_KEY', stagingKeys.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', stagingKeys.pk)
    .setEnvVariable('private', 'CLERK_API_URL', STAGING_API_URL);
}

const base = environmentConfig()
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', true)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
  .setEnvVariable('public', 'CLERK_UI_URL', constants.E2E_APP_CLERK_UI || 'http://localhost:18212/ui.browser.js');

const withKeyless = base
  .clone()
  // Creates keyless applications in our staging database.
  // Set as both private and public so it works across frameworks:
  // - Next.js reads from process.env.CLERK_API_URL (private)
  // - Nuxt reads from NUXT_PUBLIC_CLERK_API_URL via runtime config (public)
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('public', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', false);

const withEmailCodes = withInstanceKeys(
  'with-email-codes',
  base
    .clone()
    .setId('withEmailCodes')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const sessionsProd1 = withInstanceKeys(
  'sessions-prod-1',
  base
    .clone()
    .setId('sessionsProd1')
    .setEnvVariable('public', 'CLERK_JS_URL', '')
    .setEnvVariable('public', 'CLERK_UI_URL', ''),
);

const withEmailCodes_destroy_client = withEmailCodes
  .clone()
  .setEnvVariable('public', 'EXPERIMENTAL_PERSIST_CLIENT', 'false');

const withSharedUIVariant = withEmailCodes
  .clone()
  .setId('withSharedUIVariant')
  .setEnvVariable('public', 'CLERK_UI_VARIANT', 'shared');

const withEmailLinks = withInstanceKeys('with-email-links', base.clone().setId('withEmailLinks'));

const withCustomRoles = withInstanceKeys(
  'with-custom-roles',
  base
    .clone()
    .setId('withCustomRoles')
    .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
    .setEnvVariable('public', 'CLERK_UI_URL', constants.E2E_APP_CLERK_UI || 'http://localhost:18212/ui.browser.js'),
);

const withReverification = withInstanceKeys(
  'with-reverification',
  base
    .clone()
    .setId('withReverification')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withEmailCodesQuickstart = withEmailCodes
  .clone()
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '');

// Uses staging instance which runs Core 3
const withAPCore3ClerkV5 = environmentConfig()
  .setId('withAPCore3ClerkV5')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing-staging')!.sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing-staging')!.pk);

// Uses staging instance which runs Core 3
const withAPCore3ClerkV6 = environmentConfig()
  .setId('withAPCore3ClerkV6')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing-staging')!.sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing-staging')!.pk);

// Uses staging instance which runs Core 3
const withAPCore3ClerkLatest = environmentConfig()
  .setId('withAPCore3ClerkLatest')
  .setEnvVariable('public', 'CLERK_TELEMETRY_DISABLED', true)
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing-staging')!.sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing-staging')!.pk)
  .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
  .setEnvVariable('public', 'CLERK_UI_URL', constants.E2E_APP_CLERK_UI || 'http://localhost:18212/ui.browser.js');

// Special handling: uses withEmailCodes SK as the dynamic key value
const withDynamicKeys = withEmailCodes
  .clone()
  .setId('withDynamicKeys')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', '')
  .setEnvVariable('private', 'CLERK_DYNAMIC_SECRET_KEY', withEmailCodes.privateVariables.get('CLERK_SECRET_KEY'));

const withRestrictedMode = withInstanceKeys('with-restricted-mode', withEmailCodes.clone().setId('withRestrictedMode'));

const withLegalConsent = withInstanceKeys('with-legal-consent', base.clone().setId('withLegalConsent'));

const withWaitlistMode = withInstanceKeys('with-waitlist-mode', withEmailCodes.clone().setId('withWaitlistMode'));

const withEmailCodesProxy = withEmailCodes
  .clone()
  .setId('withEmailCodesProxy')
  .setEnvVariable('private', 'CLERK_PROXY_ENABLED', 'true');

const withSignInOrUpFlow = withEmailCodes
  .clone()
  .setId('withSignInOrUpFlow')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined);

const withSignInOrUpEmailLinksFlow = withEmailLinks
  .clone()
  .setId('withSignInOrUpEmailLinksFlow')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined);

const withSignInOrUpwithRestrictedModeFlow = withInstanceKeys(
  'with-restricted-mode',
  withEmailCodes
    .clone()
    .setId('withSignInOrUpwithRestrictedModeFlow')
    .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined),
);

const withSessionTasks = withInstanceKeys(
  'with-session-tasks',
  base
    .clone()
    .setId('withSessionTasks')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withSessionTasksResetPassword = withInstanceKeys(
  'with-session-tasks-reset-password',
  base.clone().setId('withSessionTasksResetPassword'),
);

const withSessionTasksSetupMfa = withInstanceKeys(
  'with-session-tasks-setup-mfa',
  base
    .clone()
    .setId('withSessionTasksSetupMfa')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withBillingJwtV2 = withInstanceKeys('with-billing', base.clone().setId('withBillingJwtV2'));

const withBilling = withInstanceKeys('with-billing', base.clone().setId('withBilling'));

const withWhatsappPhoneCode = withInstanceKeys('with-whatsapp-phone-code', base.clone().setId('withWhatsappPhoneCode'));

const withAPIKeys = withInstanceKeys('with-api-keys', base.clone().setId('withAPIKeys'));

const withProtectService = withInstanceKeys('with-protect-service', base.clone().setId('withProtectService'));

const withNeedsClientTrust = withInstanceKeys('with-needs-client-trust', base.clone().setId('withNeedsClientTrust'));

export const envs = {
  base,
  sessionsProd1,
  withAPIKeys,
  withAPCore3ClerkLatest,
  withAPCore3ClerkV5,
  withAPCore3ClerkV6,
  withBilling,
  withBillingJwtV2,
  withCustomRoles,
  withDynamicKeys,
  withEmailCodes,
  withEmailCodes_destroy_client,
  withEmailCodesProxy,
  withEmailCodesQuickstart,
  withEmailLinks,
  withKeyless,
  withLegalConsent,
  withNeedsClientTrust,
  withRestrictedMode,
  withReverification,
  withSessionTasks,
  withSessionTasksResetPassword,
  withSharedUIVariant,
  withSessionTasksSetupMfa,
  withSignInOrUpEmailLinksFlow,
  withSignInOrUpFlow,
  withSignInOrUpwithRestrictedModeFlow,
  withWaitlistMode,
  withWhatsappPhoneCode,
  withProtectService,
} as const;
