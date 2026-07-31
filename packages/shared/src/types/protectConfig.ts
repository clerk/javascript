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
