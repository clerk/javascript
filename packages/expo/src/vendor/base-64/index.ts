/**
 * Clerk-side entry for the vendored `base-64` package.
 *
 * Why this file exists:
 *   - `upstream/` is a verbatim copy of the base-64@1.0.0 npm tarball and
 *     must not be modified (byte-equivalence is the security claim — see
 *     ./README.md).
 *   - The upstream ships as a UMD wrapper — its exports are assigned to
 *     `module.exports` inside an IIFE that TypeScript cannot trace
 *     statically. tsc therefore infers an empty export surface for the
 *     `.js` file even with `allowJs: true`. The cast below asserts the
 *     export shape; the parity test (`./__tests__/parity.spec.ts`)
 *     verifies the assertion empirically against the upstream npm
 *     package.
 *   - Consumers import from this file (`../vendor/base-64`); they should
 *     not reach into `upstream/` directly.
 */

import * as upstreamModule from './upstream/base64.js';

interface Base64Module {
  encode: (input: string) => string;
  decode: (input: string) => string;
  version: string;
}

// tsc infers `typeof upstreamModule` as `{}` because base-64's UMD wrapper
// hides the module.exports assignment inside an IIFE. The shape asserted
// here is verified empirically by __tests__/parity.spec.ts against the
// upstream npm package (kept as a devDependency for this purpose).
const upstream: Base64Module = upstreamModule as unknown as Base64Module;

/**
 * Encode a binary-safe string to base64. Compatible with the WHATWG
 * `btoa()` algorithm (RFC 4648 §4). Throws on non-Latin-1 input.
 *
 * Vendored from base-64@1.0.0 — see ./README.md.
 */
export const encode: (input: string) => string = upstream.encode;

/**
 * Decode a base64-encoded string back to a binary string. Compatible with
 * the WHATWG `atob()` algorithm (RFC 4648 §4). Throws on invalid input.
 *
 * Vendored from base-64@1.0.0 — see ./README.md.
 */
export const decode: (input: string) => string = upstream.decode;
