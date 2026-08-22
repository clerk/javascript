import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

/**
 * One loader, exactly as the server serves it.
 *
 * **Field names are the wire's, not TypeScript's.** The array is assigned straight out of
 * `/v1/environment` with no case conversion, so a camelCase name here reads a field the server
 * does not send and is silently `undefined` forever. `token_timeout_ms` shipped that way and the
 * per-instance deadline it configures did nothing. Match the Go tag on
 * `antifraud/config.JSLoaderConfig`, and if a field has no tag there yet, name it as that tag
 * would be.
 */
export interface ProtectLoader {
  rollout?: number;
  target: 'head' | 'body' | `#${string}`;
  type: string;
  /**
   * Attribute values may contain the placeholders `{cid}`, `{pid}`, `{rid}` and `{sdkver}`, which
   * are substituted before the element is appended. An unrecognised `{…}` is left verbatim.
   * `{sdkver}` is how the server tells a build that interpolates from one that does not, so a
   * loader wanting the current response shape has to carry it.
   */
  attributes?: Record<string, string | number | boolean>;
  /** Substituted in the same way as `attributes`. No server field emits this yet. */
  text_content?: string;
  /**
   * Opts this loader into the upgrade mint: the Protect session token is fetched from here instead
   * of being taken from the one served inline with the loader itself. Placeholders are substituted
   * as they are in `attributes`. Only this path can report `fetch_error` or an HTTP status.
   *
   * No server field emits this yet, so no instance can currently be configured to use it.
   */
  token_url?: string;
  /**
   * How long to wait for the token before giving up and reporting a status instead. Defaults to
   * 5000 and is capped at 10000 by the SDK, so this cannot stall a sign-in.
   */
  token_timeout_ms?: number;
  /**
   * Overrides {@link ProtectConfigJSON.challenge_load_timeout_ms} for browsers that got this
   * loader. Absent inherits the instance-wide value, which may itself be absent and inherit the
   * SDK default.
   *
   * Per loader because loaders roll out gradually: while a new one ramps, two are live for the
   * same instance at once, and the new one may need a different value from the one it replaces.
   */
  challenge_load_timeout_ms?: number;
}

export interface ProtectConfigJSON {
  object: 'protect_config';
  id: string;
  loaders?: ProtectLoader[];
  /**
   * How long to wait for a verification module to LOAD before giving up, in milliseconds. Absent
   * means "use the SDK default".
   *
   * It bounds only the load. Once a verification module is running it governs its own duration,
   * so this is not a bound on how long verification may take — the two are deliberately separate
   * budgets, and only the first is the SDK's to set.
   */
  challenge_load_timeout_ms?: number;
  /**
   * Unix seconds. A session token acquired while an older value was configured is discarded and
   * re-acquired, so raising this makes every browser fetch a fresh one as its environment
   * refreshes — the recovery half of a bad mint or a key roll.
   *
   * It is **not** revocation: an outstanding token stays cryptographically valid until it expires
   * or its signing key is dropped. What this buys is that the fleet heals in minutes rather than
   * spending the token's full lifetime sending something the server will not accept.
   */
  tokens_invalid_before?: number;
}

export interface ProtectConfigResource extends ClerkResource {
  /** Not sent by every instance, and read by nothing in the SDK. */
  id?: string;
  loaders?: ProtectLoader[];
  /** See {@link ProtectConfigJSON.tokens_invalid_before}. */
  tokens_invalid_before?: number;
  /** See {@link ProtectConfigJSON.challenge_load_timeout_ms}. */
  challenge_load_timeout_ms?: number;
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
