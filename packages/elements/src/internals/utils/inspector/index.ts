import { isEnabled } from '~/internals/utils/is-enabled';

export { createBrowserInspectorReactHook } from './browser';
import { createConsoleInspector } from './console';

export const consoleInspector = createConsoleInspector({
  enabled: isEnabled(process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG || process.env.CLERK_ELEMENTS_DEBUG),
  debugServer: isEnabled(process.env.CLERK_ELEMENTS_DEBUG_SERVER),
});
