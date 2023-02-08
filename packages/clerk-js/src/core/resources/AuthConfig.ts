import type { AuthConfigJSON, AuthConfigResource } from '@clerk/types';

import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  singleSessionMode!: boolean;
  urlBasedSessionSyncing!: boolean;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    this.singleSessionMode = data ? data.single_session_mode : true;
    this.urlBasedSessionSyncing = data ? data.url_based_session_syncing : false;
    return this;
  }
}
