import { Clerk } from '@clerk/clerk-js';

import { $clerk, $csrState } from '../stores/internal';
import type { AstroClerkCreateInstanceParams, AstroClerkUpdateOptions } from '../types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import { runOnce } from './run-once';
import type { CreateClerkInstanceInternalFn } from './types';

let initOptions: AstroClerkCreateInstanceParams | undefined;

/**
 * Prevents firing clerk.load multiple times
 */
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
  //@ts-ignore
  clerk.__unstable__updateProps({
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}
