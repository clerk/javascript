import { Clerk } from '@clerk/clerk-js/headless';

import { createClerkInstance } from './createClerkInstance';

/**
 * @deprecated Use `getClerkInstance` instead. `Clerk` will be removed in the next major version.
 */
export { clerk } from './createClerkInstance';
export const getClerkInstance = createClerkInstance(Clerk);
