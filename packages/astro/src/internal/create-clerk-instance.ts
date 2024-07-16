import type { ClerkOptions } from '@clerk/types';

import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkIntegrationParams, AstroClerkUpdateOptions } from '../types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';
import { waitForClerkScript } from './utils/loadClerkJSScript';

let initOptions: ClerkOptions | undefined;

// TODO-SHARED: copied from `clerk-js`
export const CLERK_BEFORE_UNLOAD_EVENT = 'clerk:beforeunload';
export const ALLOWED_PROTOCOLS = ['http:', 'https:'];

function windowNavigate(to: URL | string): void {
  let toURL = new URL(to, window.location.href);

  if (!ALLOWED_PROTOCOLS.includes(toURL.protocol)) {
    console.warn(
      `Clerk: "${toURL.protocol}" is not a valid protocol. Redirecting to "/" instead. If you think this is a mistake, please open an issue.`,
    );
    toURL = new URL('/', window.location.href);
  }

  window.dispatchEvent(new CustomEvent(CLERK_BEFORE_UNLOAD_EVENT));
  window.location.href = toURL.href;
}

function createNavigationHandler(
  windowNav: typeof window.history.pushState | typeof window.history.replaceState,
): Exclude<ClerkOptions['routerPush'], undefined> | Exclude<ClerkOptions['routerReplace'], undefined> {
  return (to, metadata) => {
    if (metadata?.__internal_metadata?.navigationType === 'internal') {
      windowNav(history.state, '', to);
    } else {
      windowNavigate(to);
    }
  };
}

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
    routerPush: createNavigationHandler(window.history.pushState.bind(window.history)),
    routerReplace: createNavigationHandler(window.history.replaceState.bind(window.history)),
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
