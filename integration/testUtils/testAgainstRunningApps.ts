import { test } from '@playwright/test';

import type { Application } from '../models/application';
import { applicationConfig } from '../models/applicationConfig';
import type { EnvironmentConfig } from '../models/environment';
import { environmentConfig } from '../models/environment';
import { longRunningApplication } from '../models/longRunningApplication';
import { appConfigs } from '../presets';
import { parseEnvOptions } from '../scripts';

type RunningAppsParams = {
  withEnv?: EnvironmentConfig | EnvironmentConfig[];
  withPattern?: string[];
};

/**
 * We need to get the list of long-running apps
 * from the env variables as we cannot rely on the stateFile during this step.
 * Playwright evaluates the tests before the global setup/teardown hooks,
 * so the stateFile is not available yet.
 */
const runningApps = (params: RunningAppsParams = {}) => {
  const withEnv = [params.withEnv].flat().filter(Boolean);
  const withPattern = (params.withPattern || []).flat().filter(Boolean);
  const { appIds, appUrl, appPk, appSk, clerkApiUrl } = parseEnvOptions();

  if (appIds.length) {
    // if appIds are provided, we only return the apps with the given ids
    const filter = app => (withEnv.length ? withEnv.includes(app.env) : true);
    return appConfigs.longRunningApps.getByPattern(withPattern.length ? withPattern : appIds).filter(filter);
  }

  // if no appIds are provided, it means that the user is running an app manually
  // so, we return the app with the given env
  const env = environmentConfig()
    .setId('tempEnv')
    .setEnvVariable('private', 'CLERK_SECRET_KEY', appSk)
    .setEnvVariable('private', 'CLERK_API_URL', clerkApiUrl)
    .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', appPk);

  return [longRunningApplication({ id: 'standalone', env, serverUrl: appUrl, config: applicationConfig() })];
};

export function testAgainstRunningApps(runningAppsParams: RunningAppsParams) {
  return (title: string, cb: (p: { app: Application }) => void) => {
    test.describe(title, () => {
      runningApps(runningAppsParams).forEach(app => {
        test.describe(`${app.name}`, () => {
          cb({ app });
        });
      });
    });
  };
}
