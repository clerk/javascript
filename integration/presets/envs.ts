import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { automatedEnvironmentVariables } from '@clerk/shared/utils';
import fs from 'fs-extra';

import { constants } from '../constants';
import type { EnvironmentConfig } from '../models/environment';
import { environmentConfig } from '../models/environment';
import { instanceKeys } from './instanceKeys';
import type { PlatformApplication, PlatformApplicationConfig } from './platformApplication';
import { createApplicationFromConfig } from './platformApplication';

export { instanceKeys };

const STAGING_API_URL = 'https://api.clerkstage.dev';
const STAGING_KEY_PREFIX = 'clerkstage-';
const platformApplicationCachePaths = new Set<string>();

export const removePlatformApplicationCache = async () => {
  await Promise.all([...platformApplicationCachePaths].map(cachePath => fs.remove(cachePath)));
};

const isPlatformApplication = (value: unknown): value is PlatformApplication => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const application = value as Partial<PlatformApplication>;
  return Boolean(application.applicationId && application.instanceId && application.pk && application.sk);
};

const getPlatformApplication = async (
  keyName: string,
  definition: PlatformApplicationConfig,
): Promise<PlatformApplication> => {
  const platformApiKey = constants.CLERK_PLATFORM_API_KEY;
  if (!platformApiKey) {
    throw new Error('CLERK_PLATFORM_API_KEY is required to create a Platform API application.');
  }
  if (!constants.E2E_APP_ID) {
    const application = await createApplicationFromConfig(
      platformApiKey,
      keyName,
      definition,
      constants.INTEGRATION_TEST_RUN_KEY,
    );
    console.log(`Created Platform API application ${application.applicationId} for ${keyName}.`);
    return application;
  }
  const cacheKey = createHash('sha256')
    .update(keyName)
    .update(JSON.stringify(definition.config))
    .update(constants.INTEGRATION_TEST_RUN_KEY || '')
    .update(constants.E2E_APP_ID)
    .digest('hex');
  const cachePath = resolve(constants.TMP_DIR, 'platform-applications', `${cacheKey}.json`);
  platformApplicationCachePaths.add(cachePath);
  const cached = (await fs.pathExists(cachePath)) ? await fs.readJSON(cachePath, { throws: false }) : null;

  if (isPlatformApplication(cached)) {
    console.log(`Using Platform API application ${cached.applicationId} for ${keyName}.`);
    return cached;
  }

  const application = await createApplicationFromConfig(
    platformApiKey,
    keyName,
    definition,
    constants.INTEGRATION_TEST_RUN_KEY,
  );
  await fs.outputJSON(cachePath, application, { mode: 0o600 });
  console.log(`Created Platform API application ${application.applicationId} for ${keyName}.`);
  return application;
};

const loadPlatformApplicationConfig = async (configPath: string): Promise<PlatformApplicationConfig> => {
  const configModule = (await import(pathToFileURL(configPath).href)) as { default?: PlatformApplicationConfig };
  const definition = configModule.default;

  if (!definition || typeof definition !== 'object' || !('config' in definition)) {
    throw new Error(`${configPath} must export a default configuration created with defineConfig().`);
  }

  if (definition.setup !== undefined && typeof definition.setup !== 'function') {
    throw new Error(`${configPath} setup must be a function.`);
  }

  return definition;
};

/**
 * Check whether an env config is ready for staging tests.
 * In non-staging mode, always returns true.
 * In staging mode, returns true only if the config has been swapped to staging keys
 * (indicated by CLERK_API_URL being set to the staging URL).
 */
export function isStagingReady(env: EnvironmentConfig): boolean {
  if (process.env.E2E_STAGING !== '1') {
    return true;
  }
  return env.privateVariables.get('CLERK_API_URL') === STAGING_API_URL;
}

/**
 * Creates an application from a matching config file or sets PK/SK from the instance keys map.
 * When E2E_STAGING=1 is set, swaps PK/SK to staging keys (looked up as `clerkstage-<keyName>`)
 * and adds CLERK_API_URL. If the staging key doesn't exist, removes any inherited CLERK_API_URL
 * so the config falls back to production and is filtered from long-running apps by isStagingReady.
 * In non-staging mode, sets the production PK/SK and returns.
 */
async function withInstanceKeys(keyName: string, env: EnvironmentConfig): Promise<EnvironmentConfig> {
  const configPath = resolve(import.meta.dirname, '..', 'configs', `${keyName}.js`);
  // if we're not testing against staging, and the keyName provided matches a config file on disk, and we have a PLAPI
  // key, create an application and obtain its keys, otherwise use the existing instance keys
  const keys =
    process.env.E2E_STAGING !== '1' && (await fs.pathExists(configPath)) && constants.CLERK_PLATFORM_API_KEY
      ? await getPlatformApplication(keyName, await loadPlatformApplicationConfig(configPath))
      : instanceKeys.get(keyName)!;
  instanceKeys.set(keyName, keys);
  env.setEnvVariable('private', 'CLERK_SECRET_KEY', keys.sk).setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', keys.pk);

  if (process.env.E2E_STAGING !== '1') {
    return env;
  }

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
  .setEnvVariable('private', 'CLERK_API_URL', 'https://api.clerkstage.dev')
  .setEnvVariable('public', 'CLERK_KEYLESS_DISABLED', false);

automatedEnvironmentVariables.forEach(name => {
  withKeyless.setEnvVariable('private', name, 'false');
});

const withEmailCodes = await withInstanceKeys(
  'with-email-codes',
  base
    .clone()
    .setId('withEmailCodes')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const sessionsProd1 = await withInstanceKeys(
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

const withEmailLinks = await withInstanceKeys('with-email-links', base.clone().setId('withEmailLinks'));

const withEnterpriseSso = await withInstanceKeys(
  'with-enterprise-sso',
  base
    .clone()
    .setId('withEnterpriseSso')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withCustomRoles = await withInstanceKeys(
  'with-custom-roles',
  base
    .clone()
    .setId('withCustomRoles')
    .setEnvVariable('public', 'CLERK_JS_URL', constants.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js')
    .setEnvVariable('public', 'CLERK_UI_URL', constants.E2E_APP_CLERK_UI || 'http://localhost:18212/ui.browser.js'),
);

const withReverification = await withInstanceKeys(
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

const withRestrictedMode = await withInstanceKeys(
  'with-restricted-mode',
  withEmailCodes.clone().setId('withRestrictedMode'),
);

const withLegalConsent = await withInstanceKeys('with-legal-consent', base.clone().setId('withLegalConsent'));

const withWaitlistMode = await withInstanceKeys('with-waitlist-mode', withEmailCodes.clone().setId('withWaitlistMode'));

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

const withSignInOrUpwithRestrictedModeFlow = await withInstanceKeys(
  'with-restricted-mode',
  withEmailCodes
    .clone()
    .setId('withSignInOrUpwithRestrictedModeFlow')
    .setEnvVariable('public', 'CLERK_SIGN_UP_URL', undefined),
);

const withSessionTasks = await withInstanceKeys(
  'with-session-tasks',
  base
    .clone()
    .setId('withSessionTasks')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withSessionTasksResetPassword = await withInstanceKeys(
  'with-session-tasks-reset-password',
  base.clone().setId('withSessionTasksResetPassword'),
);

const withSessionTasksSetupMfa = await withInstanceKeys(
  'with-session-tasks-setup-mfa',
  base
    .clone()
    .setId('withSessionTasksSetupMfa')
    .setEnvVariable('private', 'CLERK_ENCRYPTION_KEY', constants.E2E_CLERK_ENCRYPTION_KEY || 'a-key'),
);

const withBillingJwtV2 = await withInstanceKeys('with-billing', base.clone().setId('withBillingJwtV2'));

const withBilling = await withInstanceKeys('with-billing', base.clone().setId('withBilling'));

const withWhatsappPhoneCode = await withInstanceKeys(
  'with-whatsapp-phone-code',
  base.clone().setId('withWhatsappPhoneCode'),
);

const withAPIKeys = await withInstanceKeys('with-api-keys', base.clone().setId('withAPIKeys'));

const withProtectService = await withInstanceKeys('with-protect-service', base.clone().setId('withProtectService'));

const withNeedsClientTrust = await withInstanceKeys(
  'with-needs-client-trust',
  base.clone().setId('withNeedsClientTrust'),
);

const withPasskeys = await withInstanceKeys('with-passkeys', base.clone().setId('withPasskeys'));

const withPasskeys = base
  .clone()
  .setId('withPasskeys')
  .setEnvVariable('private', 'CLERK_SECRET_KEY', instanceKeys.get('with-passkeys').sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', instanceKeys.get('with-passkeys').pk);

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
  withEnterpriseSso,
  withKeyless,
  withLegalConsent,
  withNeedsClientTrust,
  withPasskeys,
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
