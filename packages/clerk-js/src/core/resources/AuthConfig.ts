import type { AuthConfigJSON, AuthConfigJSONSnapshot, AuthConfigResource, PhoneCodeChannel } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './Base';

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
    this.claimedAt = this.withDefault(data.claimed_at ? unixEpochToDate(data.claimed_at) : null, this.claimedAt);
    this.reverification = this.withDefault(data.reverification, this.reverification);
    this.singleSessionMode = this.withDefault(data.single_session_mode, this.singleSessionMode);
    this.preferredChannels = this.withDefault(data.preferred_channels, this.preferredChannels);
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
