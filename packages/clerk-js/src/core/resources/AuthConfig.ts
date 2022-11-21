import type { AuthConfigJSON, AuthConfigResource } from '@clerk/types';

import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  singleSessionMode!: boolean;
  cookielessDev!: boolean;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    this.singleSessionMode = data ? data.single_session_mode : true;
    this.cookielessDev = data ? data.cookieless_dev : false;
    return this;
  }
}
