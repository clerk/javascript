<<<<<<< HEAD
import { waitForClerkScript } from '../internal/utils/loadClerkJSScript';
import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkIntegrationParams, AstroClerkUpdateOptions } from '../types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';

let initOptions: AstroClerkIntegrationParams | undefined;
=======
import { Clerk } from '@clerk/clerk-js';

import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkCreateInstanceParams, AstroClerkUpdateOptions } from '../types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';
import type { CreateClerkInstanceInternalFn } from './types';

let initOptions: AstroClerkCreateInstanceParams | undefined;
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)

/**
 * Prevents firing clerk.load multiple times
 */
<<<<<<< HEAD
export const createClerkInstance = runOnce(createClerkInstanceInternal);

export async function createClerkInstanceInternal(options?: AstroClerkIntegrationParams) {
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

  initOptions = options;
  // TODO: Update Clerk type from @clerk/types to include this method
  return (clerkJSInstance as any)
=======
export const createClerkInstance: CreateClerkInstanceInternalFn = runOnce(createClerkInstanceInternal);

export function createClerkInstanceInternal(options?: AstroClerkCreateInstanceParams) {
  let clerkJSInstance = window.Clerk as unknown as Clerk;
  if (!clerkJSInstance) {
    clerkJSInstance = new Clerk(options!.publishableKey);
    // @ts-ignore
    $clerk.set(clerkJSInstance);
    // @ts-ignore
    window.Clerk = clerkJSInstance;
  }

  initOptions = options;
  return clerkJSInstance
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
    .load(options)
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

export function updateClerkOptions(options: AstroClerkUpdateOptions) {
  const clerk = $clerk.get();
  if (!clerk) {
    throw new Error('Missing clerk instance');
  }
<<<<<<< HEAD
  // TODO: Update Clerk type from @clerk/types to include this method
  void (clerk as any).__unstable__updateProps({
=======
  //@ts-ignore
  clerk.__unstable__updateProps({
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}
