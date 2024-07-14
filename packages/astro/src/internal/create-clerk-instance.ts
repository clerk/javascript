import type { ClerkOptions } from '@clerk/types';

import { waitForClerkScript } from '../internal/utils/loadClerkJSScript';
import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkIntegrationParams, AstroClerkUpdateOptions } from '../types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';

let initOptions: ClerkOptions | undefined;

/**
 * Prevents firing clerk.load multiple times
 */
const createClerkInstance = runOnce(createClerkInstanceInternal);

async function createClerkInstanceInternal(options?: AstroClerkIntegrationParams) {
  let clerkJSInstance = window.Clerk;
  if (!clerkJSInstance) {
    await waitForClerkScript();

    if (!window.Clerk) {
      throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
    }
    clerkJSInstance = window.Clerk;
  }

  if (!$clerk.get()) {
    // @ts-ignore
    $clerk.set(clerkJSInstance);
  }

  initOptions = {
    ...options,
    routerPush: to => window.history.pushState(history.state, '', to),
    routerReplace(to) {
      window.history.replaceState(history.state, '', to);
    },
  };

  // TODO: Update Clerk type from @clerk/types to include this method
  return (clerkJSInstance as any)
    .load(initOptions)
    .then(() => {
      $csrState.setKey('isLoaded', true);

      mountAllClerkAstroJSComponents();

      clerkJSInstance.addListener(payload => {
        $csrState.setKey('client', payload.client);
        $csrState.setKey('user', payload.user);
        $csrState.setKey('session', payload.session);
        $csrState.setKey('organization', payload.organization);
      });
    })
    .catch(() => {});
}

function updateClerkOptions(options: AstroClerkUpdateOptions) {
  const clerk = $clerk.get();
  if (!clerk) {
    throw new Error('Missing clerk instance');
  }
  // TODO: Update Clerk type from @clerk/types to include this method
  void (clerk as any).__unstable__updateProps({
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}

export { createClerkInstance, updateClerkOptions };
