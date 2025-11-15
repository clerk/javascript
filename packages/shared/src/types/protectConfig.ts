import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

export interface ProtectLoader {
  target: 'head' | 'body';
  type: string;
  attributes: Record<string, string | number | boolean>;
}

export interface ProtectConfigJSON {
  object: 'protect_config';
  id: string;
  rollout?: number;
  loader?: ProtectLoader;
}

export interface ProtectConfigResource extends ClerkResource {
  id: string;
  loader?: ProtectLoader;
  rollout?: number;
  __internal_toSnapshot: () => ProtectConfigJSONSnapshot;
}
