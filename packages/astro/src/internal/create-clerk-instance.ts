import {
  loadClerkJsScript,
  loadClerkUiScript,
  setClerkJsLoadingErrorPackageName,
} from '@clerk/shared/loadClerkJsScript';
import type { ClerkOptions } from '@clerk/shared/types';
import type { ClerkUiConstructor } from '@clerk/shared/ui';

import { $clerkStore } from '../stores/external';
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
  let clerkUiCtor: Promise<ClerkUiConstructor> | undefined;

  if (!clerkJSInstance) {
    // Load both clerk-js and clerk-ui in parallel
    const clerkPromise = loadClerkJsScript(options);
    clerkUiCtor = loadClerkUiScript(options).then(() => {
      if (!window.__unstable_ClerkUiCtor) {
        throw new Error('Failed to download latest Clerk UI. Contact support@clerk.com.');
      }
      // After the check, TypeScript knows it's defined
      return window.__unstable_ClerkUiCtor;
    });

    await clerkPromise;

    if (!window.Clerk) {
      throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
    }
    clerkJSInstance = window.Clerk;
  }

  if (!$clerk.get()) {
    $clerk.set(clerkJSInstance);
  }

  initOptions = {
    routerPush: createNavigationHandler(window.history.pushState.bind(window.history)),
    routerReplace: createNavigationHandler(window.history.replaceState.bind(window.history)),
    ...options,
    // Pass the clerk-ui constructor promise to clerk.load()
    clerkUiCtor,
  };

  return clerkJSInstance
    .load(initOptions)
    .then(() => {
      $csrState.setKey('isLoaded', true);
      // Notify subscribers that $clerkStore has been loaded.
      // We're doing this because nanostores uses `===` for equality
      // and just by setting the value to `window.Clerk` again won't trigger an update.
      // We notify only once as this store is for advanced users.
      $clerkStore.notify();

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
  // `__unstable__updateProps` is not exposed as public API from `@clerk/types`
  void (clerk as any).__unstable__updateProps({
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}

export { createClerkInstance, updateClerkOptions };
