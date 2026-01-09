import {
  loadClerkJsScript,
  loadClerkUiScript,
  setClerkJsLoadingErrorPackageName,
} from '@clerk/shared/loadClerkJsScript';
import type { ClerkOptions } from '@clerk/shared/types';
import type { ClerkUiConstructor } from '@clerk/shared/ui';
import type { Ui } from '@clerk/ui/internal';

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

async function createClerkInstanceInternal<TUi extends Ui = Ui>(options?: AstroClerkCreateInstanceParams<TUi>) {
  // Load clerk-js and clerk-ui in parallel.
  // Both functions return early if the scripts are already loaded
  // (e.g., via middleware-injected script tags in the HTML head).
  const clerkJsChunk = getClerkJsEntryChunk(options);
  const clerkUiCtor = getClerkUiEntryChunk(options);

  await clerkJsChunk;

  if (!window.Clerk) {
    throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
  }

  const clerkJSInstance = window.Clerk;

  if (!$clerk.get()) {
    $clerk.set(clerkJSInstance);
  }

  const clerkOptions = {
    routerPush: createNavigationHandler(window.history.pushState.bind(window.history)),
    routerReplace: createNavigationHandler(window.history.replaceState.bind(window.history)),
    ...options,
    // Pass the clerk-ui constructor promise to clerk.load()
    clerkUiCtor,
  } as unknown as ClerkOptions;

  initOptions = clerkOptions;

  return clerkJSInstance
    .load(clerkOptions)
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

function updateClerkOptions<TUi extends Ui = Ui>(options: AstroClerkUpdateOptions<TUi>) {
  const clerk = $clerk.get();
  if (!clerk) {
    throw new Error('Missing clerk instance');
  }
  const updateOptions = {
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  } as unknown as { options: ClerkOptions; appearance?: any };
  // `__internal_updateProps` is not exposed as public API from `@clerk/types`
  void (clerk as any).__internal_updateProps(updateOptions);
}

/**
 * Loads clerk-js script if not already loaded.
 * Returns early if window.Clerk already exists.
 */
async function getClerkJsEntryChunk<TUi extends Ui = Ui>(options?: AstroClerkCreateInstanceParams<TUi>): Promise<void> {
  await loadClerkJsScript(options);
}

/**
 * Checks if the provided ui option is a ClerkUi constructor (class)
 * rather than a version pinning object
 */
function isUiConstructor(ui: unknown): ui is ClerkUiConstructor {
  return typeof ui === 'function' && 'version' in ui;
}

/**
 * Gets the ClerkUI constructor, either from options or by loading the script.
 * Returns early if window.__internal_ClerkUiCtor already exists.
 */
async function getClerkUiEntryChunk<TUi extends Ui = Ui>(
  options?: AstroClerkCreateInstanceParams<TUi>,
): Promise<ClerkUiConstructor> {
  // If ui is a constructor (ClerkUI class), use it directly
  if (isUiConstructor(options?.ui)) {
    return options.ui;
  }

  await loadClerkUiScript(options);

  if (!window.__internal_ClerkUiCtor) {
    throw new Error('Failed to download latest Clerk UI. Contact support@clerk.com.');
  }

  return window.__internal_ClerkUiCtor;
}

export { createClerkInstance, updateClerkOptions };
