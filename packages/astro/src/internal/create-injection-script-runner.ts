import type { InitialState } from '@clerk/types';

import { $initialState } from '../stores/internal';
import type { AstroClerkIntegrationParams } from '../types';
import { CLERK_ASTRO_DATA, CLERK_ASTRO_SAFE_VARS, readHeadData } from '../utils/head-data';
import { mergeEnvVarsWithParams } from './merge-env-vars-with-params';
import type { CreateClerkInstanceInternalFn } from './types';

/**
 * @internal
 * Before initializing Clerk do:
 * 1) Populate stores with the authentication state during SSR.
 * 2) Merge the environment variables from the server context with the ones from the integration.
 */
function createInjectionScriptRunner(creator: CreateClerkInstanceInternalFn) {
  async function runner(astroClerkOptions?: AstroClerkIntegrationParams) {
    const initialState = readHeadData<InitialState>(CLERK_ASTRO_DATA);
    if (initialState) {
      $initialState.set(initialState);
    }
    const clientSafeVars = readHeadData<Record<string, unknown>>(CLERK_ASTRO_SAFE_VARS) ?? {};

    await creator(mergeEnvVarsWithParams({ ...astroClerkOptions, ...clientSafeVars }));
  }

  return runner;
}

export { createInjectionScriptRunner };
