import { isTruthy } from '@clerk/shared/underscore';

export { createBrowserInspectorReactHook } from './browser';
import { createConsoleInspector } from './console';

export const consoleInspector = createConsoleInspector({
  enabled: isTruthy(process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG ?? process.env.CLERK_ELEMENTS_DEBUG),
  debugServer: isTruthy(process.env.CLERK_ELEMENTS_DEBUG_SERVER),
});
