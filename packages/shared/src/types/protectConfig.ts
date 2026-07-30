import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

export interface ProtectLoader {
  rollout?: number;
  target: 'head' | 'body' | `#${string}`;
  type: string;
  /**
   * Attribute values may contain the placeholders `{cid}`, `{pid}`, `{rid}` and `{instance_id}`,
   * which are substituted before the element is appended. An unrecognised `{…}` is left verbatim.
   */
  attributes?: Record<string, string | number | boolean>;
  textContent?: string;
  /**
   * Where to acquire the Protect session token for this load. Placeholders are substituted as they
   * are in `attributes`. Defaults to `token` resolved relative to the loader URL carrying the
   * `{cid}`, which is correct whenever the `{cid}` appears as a path segment.
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
