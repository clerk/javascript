import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

export interface ProtectLoader {
  rollout?: number;
  target: 'head' | 'body' | `#${string}`;
  type: string;
  attributes?: Record<string, string | number | boolean>;
  textContent?: string;
}

export interface ProtectConfigJSON {
  object: 'protect_config';
  id: string;
  loaders?: ProtectLoader[];
}

export interface ProtectConfigResource extends ClerkResource {
  id: string;
  loaders?: ProtectLoader[];
  __internal_toSnapshot: () => ProtectConfigJSONSnapshot;
}

/**
 * Returns the Protect assertion to attach to the next sign-in or sign-up request, or
 * `undefined` to attach none.
 *
 * Called per request, so a token refreshed in the background is picked up without
 * re-configuring Clerk. It must not throw, and a rejected promise is treated the same as
 * `undefined`: an assertion may influence a sign-in, but never prevent one.
 *
 * @inline
 */
export type ProtectAssertionResolver = () => string | undefined | Promise<string | undefined>;

/**
 * A Protect assertion: a short-lived, signed token you mint from your own backend with the
 * Clerk Backend API, carrying key/value pairs your Protect rules can read.
 *
 * Pass a `string` if you already have one, or a function to have it re-read for each
 * sign-in or sign-up request. Prefer the function when a page can outlive the token —
 * assertions are short-lived by design, and a string captured at load time stops applying
 * once it expires.
 *
 * The assertion is an input to rules you author, never a decision on its own, and it only
 * applies from the context you constrained it to when you minted it.
 *
 * @inline
 */
export type ProtectAssertion = string | ProtectAssertionResolver;
