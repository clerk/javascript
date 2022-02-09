import type {
  Attributes,
  OauthProviders,
  OAuthStrategy,
  SignInData,
  SignUpData,
  UserSettingsJSON,
  UserSettingsResource,
  Web3Strategy,
} from '@clerk/types';

import {BaseResource} from './Base';

/**
 * @internal
 */
export class UserSettings extends BaseResource implements UserSettingsResource {
  id = undefined;
  social!: OauthProviders;
  attributes!: Attributes;
  signIn!: SignInData;
  signUp!: SignUpData;

  socialProviderStrategies: OAuthStrategy[] = [];
  web3FirstFactors: Web3Strategy[] = [];
  standardFormAttributes: Array<keyof UserSettingsResource['attributes']> = [];

  public constructor(data: UserSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: UserSettingsJSON): this {
    this.social = data.social;
    this.attributes = data.attributes;
    this.signIn = data.sign_in;
    this.signUp = data.sign_up;
    this.socialProviderStrategies = this.getSocialProviderStrategies(data.social);
    this.web3FirstFactors = this.getWeb3FirstFactors(data.attributes);
    this.standardFormAttributes = this.getStandardFormAttributes(data.attributes);
    return this;
  }

  private getStandardFormAttributes(attributes: Attributes): Array<keyof UserSettingsResource['attributes']> {
    return Object.entries(attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && !name.startsWith('web3'))
      .map(([name]) => name) as Array<keyof UserSettingsResource['attributes']>;
  }

  private getWeb3FirstFactors(attributes: Attributes): Web3Strategy[] {
    return Object.entries(attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && name.startsWith('web3'))
      .map(([, desc]) => desc.first_factors)
      .flat() as any as Web3Strategy[];
  }

  private getSocialProviderStrategies(social: OauthProviders): OAuthStrategy[] {
    return Object.entries(social)
      .filter(([, desc]) => desc.enabled)
      .map(([, desc]) => desc.strategy);
  }
}
