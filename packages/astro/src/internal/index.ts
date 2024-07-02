/**
 * The following code will be used in order to be injected as script via the astro integration.
 * F.e.
 *
 * injectScript('before-hydration', `...`)
 */

import { createClerkInstance } from '../client';
import { createInjectionScriptRunner } from './create-injection-script-runner';

const runInjectionScript = createInjectionScriptRunner(createClerkInstance);

export { runInjectionScript };
