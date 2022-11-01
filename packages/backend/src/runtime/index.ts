/**
 * This file exports APIs that vary across runtimes (i.e. Node & Browser - V8 isolates)
 * as a singleton object.
 *
 * Runtime polyfills are written in VanillaJS for now to avoid TS complication. Moreover,
 * due to this issue https://github.com/microsoft/TypeScript/issues/44848, there is not a good way
 * to tell Typescript which conditional import to use during build type.
 *
 * The Runtime type definition ensures type safety for now.
 * Runtime js modules are copied into dist folder with bash script.
 *
 * TODO: Support TS runtime modules
 */

// @ts-expect-error
import crypto from '#crypto';
// @ts-expect-error
import fetch from '#fetch';

type Runtime = {
  crypto: Crypto;
  fetch: typeof global.fetch;
};

const runtime: Runtime = { crypto, fetch };

export default runtime;
