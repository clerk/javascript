import { loadClerkJsScript, setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';
import type { ClerkOptions } from '@clerk/types';

import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkCreateInstanceParams, AstroClerkUpdateOptions } from '../types';
import { invokeClerkAstroJSFunctions } from './invoke-clerk-astro-js-functions';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';

let initOptions: ClerkOptions | undefined;

setClerkJsLoadingErrorPackageName(PACKAGE_NAME);

function createNavigationHandler(
  windowNav: typeof window.history.pushState | typeof window.history.replaceState,
): Exclude<ClerkOptions['routerPush'], undefined> | Exclude<ClerkOptions['routerReplace'], undefined> {
  return (to, opts) => {
    if (opts?.__internal_metadata?.navigationType === 'internal') {
      windowNav(history.state, '', to);
    } else {
      opts?.windowNavigate(to);
    }
  };
}

/**
 * Prevents firing clerk.load() multiple times
 */
const createClerkInstance = runOnce(createClerkInstanceInternal);

async function createClerkInstanceInternal(options?: AstroClerkCreateInstanceParams) {
  let clerkJSInstance = window.Clerk;
  if (!clerkJSInstance) {
    await loadClerkJsScript(options);

    if (!window.Clerk) {
      throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
    }
    clerkJSInstance = window.Clerk;
  }

  if (!$clerk.get()) {
    $clerk.set(clerkJSInstance);
  }

  initOptions = {
    ...options,
    routerPush: createNavigationHandler(window.history.pushState.bind(window.history)),
    routerReplace: createNavigationHandler(window.history.replaceState.bind(window.history)),
  };

  return clerkJSInstance
    .load(initOptions)
    .then(() => {
      $csrState.setKey('isLoaded', true);

      mountAllClerkAstroJSComponents();
      invokeClerkAstroJSFunctions();

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
