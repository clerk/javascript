import type { ClerkResource } from './resource';
import type { ProtectConfigJSONSnapshot } from './snapshots';

export interface ProtectLoader {
  rollout?: number;
  target: 'head' | 'body' | `#${string}`;
  type: string;
  attributes?: Record<string, string | number | boolean>;
  textContent?: string;
  bootstrap?: boolean; // should be set on at most one loader in ProtectConfig
}

export interface ProtectConfigJSON {
  object: 'protect_config';
  id: string;
  loaders?: ProtectLoader[];
  protectStateTimeout?: number;
}

export interface ProtectConfigResource extends ClerkResource {
  id: string;
  loaders?: ProtectLoader[];
  protectStateTimeout?: number;
  __internal_toSnapshot: () => ProtectConfigJSONSnapshot;
}

export interface ProtectState {
  v: number;
  id: string;
}
