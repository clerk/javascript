import type {
  Attributes,
  OauthProviders,
  SignInData,
  SignUpData,
  UserSettingsJSON,
  UserSettingsResource,
} from '@clerk/types';

import { BaseResource } from './Base';

export class UserSettings extends BaseResource implements UserSettingsResource {
  id = undefined;
  social!: OauthProviders;
  attributes!: Attributes;
  signIn!: SignInData;
  signUp!: SignUpData;

  public constructor(data: UserSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: UserSettingsJSON): this {
    this.social = data.social;
    this.attributes = data.attributes;
    this.signIn = data.sign_in;
    this.signUp = data.sign_up;
    return this;
  }
}
