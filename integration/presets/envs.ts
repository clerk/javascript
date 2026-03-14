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
 * When E2E_STAGING=1 is set, swaps PK/SK to staging keys and adds CLERK_API_URL.
 * If the staging key doesn't exist, removes any inherited CLERK_API_URL so the config
 * falls back to production and is filtered from long-running apps by isStagingReady.
 * In non-staging mode, returns the env config unchanged.
 */
function withStagingSupport(env: EnvironmentConfig, prodKeyName: string): EnvironmentConfig {
  if (process.env.E2E_STAGING !== '1') return env;
  const stagingKeyName = STAGING_KEY_PREFIX + prodKeyName;
  if (!instanceKeys.has(stagingKeyName)) {
    // Remove staging API URL if inherited from parent clone to prevent
    // production keys from being used against the staging API
    env.privateVariables.delete('CLERK_API_URL');
    return env;
  }
  const keys = instanceKeys.get(stagingKeyName)!;
  return env
    .setEnvVariable('private', 'CLERK_SECRET_KEY', keys.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', keys.pk)
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
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', false);

const withEmailCodes = withStagingSupport(
  base
    .clone()
    .setId('withEmailCodes')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-codes')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-codes')!.pk)
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
  'with-email-codes',
);

const sessionsProd1 = withStagingSupport(
  base
    .clone()
    .setId('sessionsProd1')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('sessions-prod-1')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('sessions-prod-1')!.pk)
    .setEnvVariable('public', 'CLERK_JS_URL', '')
    .setEnvVariable('public', 'CLERK_UI_URL', ''),
  'sessions-prod-1',
);

const withEmailCodes_destroy_client = withEmailCodes
  .clone()
  .setEnvVariable('public', 'EXPERIMENTAL_PERSIST_CLIENT', 'false');

const withSharedUIVariant = withEmailCodes
  .clone()
  .setId('withSharedUIVariant')
  .setEnvVariable('public', 'CLERK_UI_VARIANT', 'shared');

const withEmailLinks = withStagingSupport(
  base
    .clone()
    .setId('withEmailLinks')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-email-links')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-email-links')!.pk),
  'with-email-links',
);

const withCustomRoles = withStagingSupport(
  base
    .clone()
    .setId('withCustomRoles')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-custom-roles')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-custom-roles')!.pk)
    .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
    .setEnvVariable('public', 'CLERK_UI_URL', constants.E2E_APP_CLERK_UI || 'http://localhost:18212/ui.browser.js'),
  'with-custom-roles',
);

const withReverification = withStagingSupport(
  base
    .clone()
    .setId('withReverification')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-reverification')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-reverification')!.pk)
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
  'with-reverification',
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

const withRestrictedMode = withStagingSupport(
  withEmailCodes
    .clone()
    .setId('withRestrictedMode')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-restricted-mode')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-restricted-mode')!.pk),
  'with-restricted-mode',
);

const withLegalConsent = withStagingSupport(
  base
    .clone()
    .setId('withLegalConsent')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-legal-consent')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-legal-consent')!.pk),
  'with-legal-consent',
);

const withWaitlistMode = withStagingSupport(
  withEmailCodes
    .clone()
    .setId('withWaitlistMode')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-waitlist-mode')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-waitlist-mode')!.pk),
  'with-waitlist-mode',
);

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

const withSignInOrUpwithRestrictedModeFlow = withStagingSupport(
  withEmailCodes
    .clone()
    .setId('withSignInOrUpwithRestrictedModeFlow')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-restricted-mode')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-restricted-mode')!.pk)
    .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined),
  'with-restricted-mode',
);

const withSessionTasks = withStagingSupport(
  base
    .clone()
    .setId('withSessionTasks')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-session-tasks')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-session-tasks')!.pk)
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
  'with-session-tasks',
);

const withSessionTasksResetPassword = withStagingSupport(
  base
    .clone()
    .setId('withSessionTasksResetPassword')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-session-tasks-reset-password')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-session-tasks-reset-password')!.pk),
  'with-session-tasks-reset-password',
);

const withSessionTasksSetupMfa = withStagingSupport(
  base
    .clone()
    .setId('withSessionTasksSetupMfa')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-session-tasks-setup-mfa')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-session-tasks-setup-mfa')!.pk)
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
  'with-session-tasks-setup-mfa',
);

const withBillingJwtV2 = withStagingSupport(
  base
    .clone()
    .setId('withBillingJwtV2')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing')!.pk),
  'with-billing',
);

const withBilling = withStagingSupport(
  base
    .clone()
    .setId('withBilling')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-billing')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-billing')!.pk),
  'with-billing',
);

const withWhatsappPhoneCode = withStagingSupport(
  base
    .clone()
    .setId('withWhatsappPhoneCode')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-whatsapp-phone-code')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-whatsapp-phone-code')!.pk),
  'with-whatsapp-phone-code',
);

const withAPIKeys = withStagingSupport(
  base
    .clone()
    .setId('withAPIKeys')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-api-keys')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-api-keys')!.pk),
  'with-api-keys',
);

const withProtectService = withStagingSupport(
  base
    .clone()
    .setId('withProtectService')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-protect-service')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-protect-service')!.pk),
  'with-protect-service',
);

const withNeedsClientTrust = withStagingSupport(
  base
    .clone()
    .setId('withNeedsClientTrust')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-needs-client-trust')!.sk)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-needs-client-trust')!.pk),
  'with-needs-client-trust',
);

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
