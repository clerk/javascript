import type { AuthConfigJSON, AuthConfigResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  singleSessionMode!: boolean;
  claimedAt: Date | null = null;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    this.singleSessionMode = data ? data.single_session_mode : true;
    this.claimedAt = data?.claimed_at ? unixEpochToDate(data.claimed_at) : null;
    return this;
  }

  public toJSON(): AuthConfigJSON {
    return {
      object: 'auth_config',
      id: this.id || '',
      single_session_mode: this.singleSessionMode,
      claimed_at: this.claimedAt ? this.claimedAt.getTime() : null,
    };
  }
}
