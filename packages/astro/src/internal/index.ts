/**
 * The following code will be used in order to be injected as script via the astro integration.
 * F.e.
 *
 * injectScript('before-hydration', `...`)
 */

import { createClerkInstance } from './create-clerk-instance';
import { createInjectionScriptRunner } from './create-injection-script-runner';

const runInjectionScript = createInjectionScriptRunner(createClerkInstance);

export { runInjectionScript };

export { generateSafeId } from './utils/generateSafeId';
export { swapDocument } from './swap-document';
export { NETLIFY_CACHE_BUST_PARAM, removeNetlifyCacheBustParam } from './remove-query-param';
