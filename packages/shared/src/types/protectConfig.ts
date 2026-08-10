import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

export interface ProtectLoader {
  rollout?: number;
  target: 'head' | 'body' | `#${string}`;
  type: string;
  /**
   * Attribute values may contain the placeholders `{cid}`, `{pid}`, `{rid}`, `{instance_id}` and
   * `{sdkver}`, which are substituted before the element is appended. An unrecognised `{…}` is
   * left verbatim. `{sdkver}` is how the server tells a build that interpolates from one that
   * does not, so a loader wanting the current response shape has to carry it.
   */
  attributes?: Record<string, string | number | boolean>;
  /** Substituted in the same way as `attributes`. */
  textContent?: string;
  /**
   * Opts this loader into the upgrade mint: the Protect session token is fetched from here instead
   * of being taken from the one served inline with the loader itself. Placeholders are substituted
   * as they are in `attributes`. Only this path can report `fetch_error` or an HTTP status.
   */
  tokenUrl?: string;
  /**
   * How long to wait for the token before giving up and reporting a status instead. Defaults to
   * 5000.
   */
  tokenTimeoutMs?: number;
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
 */
export type ProtectAssertion = string | ProtectAssertionResolver;
