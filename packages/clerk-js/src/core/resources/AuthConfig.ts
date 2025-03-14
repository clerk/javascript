import type { AuthConfigJSON, AuthConfigJSONSnapshot, AuthConfigResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  claimedAt: Date | null = null;
  reverification: boolean = true;
  singleSessionMode: boolean = true;

  public constructor(data: AuthConfigJSON | null = null) {
    super();
    if (data) {
      this.fromJSON(data);
    }
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    if (!data) {
      return this;
    }
    this.claimedAt = data.claimed_at ? unixEpochToDate(data.claimed_at) : null;
    this.reverification = data.reverification ?? true;
    this.singleSessionMode = data.single_session_mode ?? true;
    return this;
  }

  public __internal_toSnapshot(): AuthConfigJSONSnapshot {
    return {
      object: 'auth_config',
      claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
      id: this.id ?? '',
      reverification: this.reverification,
      single_session_mode: this.singleSessionMode,
    };
  }
}
