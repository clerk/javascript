export { clerkMiddleware } from './clerkMiddleware';
export type { ClerkMiddlewareOptions } from './clerkMiddleware';

export { getAuth } from './getAuth';

import type { ClerkHonoVariables } from './types';
export type { ClerkHonoVariables };

// Augment Hono's ContextVariableMap so users get type inference
// for c.get('clerk') and c.get('clerkAuth')
declare module 'hono' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ContextVariableMap extends ClerkHonoVariables {}
}
