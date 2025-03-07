import type { AuthConfigJSON, AuthConfigJSONSnapshot, AuthConfigResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  singleSessionMode!: boolean;
  claimedAt: Date | null = null;
  reverification!: boolean;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    this.singleSessionMode = data ? data.single_session_mode : true;
    this.claimedAt = data?.claimed_at ? unixEpochToDate(data.claimed_at) : null;
    this.reverification = data ? data.reverification : true;
    return this;
  }

  public __internal_toSnapshot(): AuthConfigJSONSnapshot {
    return {
      object: 'auth_config',
      id: this.id || '',
      single_session_mode: this.singleSessionMode,
      claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
      reverification: this.reverification,
    };
  }
}
