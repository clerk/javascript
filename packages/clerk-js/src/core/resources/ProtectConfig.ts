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
  tokens_invalid_before?: number;
  rollout?: number;

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
    this.tokens_invalid_before = this.withDefault(data.tokens_invalid_before, this.tokens_invalid_before);

    return this;
  }

  public __internal_toSnapshot(): ProtectConfigJSONSnapshot {
    return {
      object: 'protect_config',
      id: this.id,
      loaders: this.loaders,
      tokens_invalid_before: this.tokens_invalid_before,
    };
  }
}
