import type { AuthConfigJSON, AuthConfigJSONSnapshot, AuthConfigResource, PhoneCodeChannel } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON, serializeToJSON } from './parser';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  claimedAt: Date | null = null;
  reverification: boolean = false;
  singleSessionMode: boolean = false;
  preferredChannels: Record<string, PhoneCodeChannel> | null = null;

  public constructor(data: Partial<AuthConfigJSON> | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: Partial<AuthConfigJSON> | null): this {
    Object.assign(
      this,
      parseJSON<AuthConfigResource>(data, {
        dateFields: ['claimedAt'],
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): AuthConfigJSONSnapshot {
    return {
      object: 'auth_config',
      ...serializeToJSON(this),
    } as AuthConfigJSONSnapshot;
  }
}
