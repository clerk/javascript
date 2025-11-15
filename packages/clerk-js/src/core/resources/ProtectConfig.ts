import type {
  ProtectConfigJSON,
  ProtectConfigJSONSnapshot,
  ProtectConfigResource,
  ProtectLoader,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

export class ProtectConfig extends BaseResource implements ProtectConfigResource {
  id: string = '';
  enabled: boolean = false;
  loader?: ProtectLoader;

  public constructor(data: ProtectConfigJSON | ProtectConfigJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: ProtectConfigJSON | ProtectConfigJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = this.withDefault(data.id, this.id);
    this.enabled = this.withDefault(data.enabled, this.enabled);
    this.loader = this.withDefault(data.loader, this.loader);

    return this;
  }

  public __internal_toSnapshot(): ProtectConfigJSONSnapshot {
    return {
      object: 'protect_config',
      id: this.id,
      enabled: this.enabled,
      loader: this.loader,
    };
  }
}
