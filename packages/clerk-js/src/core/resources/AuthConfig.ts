import type { AuthConfigJSON, AuthConfigJSONSnapshot, AuthConfigResource, PhoneCodeChannel } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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
    if (!data) {
      return this;
    }

    Object.assign(
      this,
      parseJSON<AuthConfigResource>(data, {
        dateFields: ['claimedAt'],
        defaultValues: {
          claimedAt: null,
          reverification: false,
          singleSessionMode: false,
          preferredChannels: null,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): AuthConfigJSONSnapshot {
    return {
      claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
      id: this.id ?? '',
      object: 'auth_config',
      reverification: this.reverification,
      single_session_mode: this.singleSessionMode,
    };
  }
}
