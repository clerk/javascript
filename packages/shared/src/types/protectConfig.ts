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
