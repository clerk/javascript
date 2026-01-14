import type {
  ProtectConfigJSON,
  ProtectConfigJSONSnapshot,
  ProtectConfigResource,
  ProtectLoader,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class ProtectConfig extends BaseResource implements ProtectConfigResource {
  id: string = '';
  loaders?: ProtectLoader[];
  rollout?: number;
  protectStateTimeout: number = 0;

  public constructor(data: ProtectConfigJSON | ProtectConfigJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: ProtectConfigJSON | ProtectConfigJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = this.withDefault(data.id, this.id);
    this.loaders = this.withDefault(data.loaders, this.loaders);
    this.protectStateTimeout = this.withDefault(data.protectStateTimeout, this.protectStateTimeout);

    return this;
  }

  public __internal_toSnapshot(): ProtectConfigJSONSnapshot {
    return {
      object: 'protect_config',
      id: this.id,
      loaders: this.loaders,
    };
  }
}
