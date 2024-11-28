import type { AuthConfigJSON, AuthConfigResource } from '@clerk/types';

import { BaseResource } from './internal';

export class AuthConfig extends BaseResource implements AuthConfigResource {
  singleSessionMode!: boolean;

  public constructor(data: AuthConfigJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: AuthConfigJSON | null): this {
    this.singleSessionMode = data ? data.single_session_mode : true;
    return this;
  }

  public toJSON(): AuthConfigJSON {
    return {
      object: 'auth_config',
      id: this.id || '',
      single_session_mode: this.singleSessionMode,
    };
  }
}
