import type {
  Attributes,
  OAuthProviders,
  OAuthStrategy,
  SignInData,
  SignUpData,
  UserSettingsJSON,
  UserSettingsResource,
  Web3Strategy,
} from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class UserSettings extends BaseResource implements UserSettingsResource {
  id = undefined;
  social!: OAuthProviders;
  attributes!: Attributes;
  signIn!: SignInData;
  signUp!: SignUpData;

  socialProviderStrategies: OAuthStrategy[] = [];
  web3FirstFactors: Web3Strategy[] = [];
  enabledFirstFactorIdentifiers: Array<keyof UserSettingsResource['attributes']> = [];

  public constructor(data: UserSettingsJSON) {
    super();
    this.fromJSON(data);
  }

  get instanceIsPasswordBased() {
    return this.attributes.password.enabled && this.attributes.password.required;
  }

  protected fromJSON(data: UserSettingsJSON): this {
    this.social = data.social;
    this.attributes = data.attributes;
    this.signIn = data.sign_in;
    this.signUp = data.sign_up;
    this.socialProviderStrategies = this.getSocialProviderStrategies(data.social);
    this.web3FirstFactors = this.getWeb3FirstFactors(data.attributes);
    this.enabledFirstFactorIdentifiers = this.getEnabledFirstFactorIdentifiers(data.attributes);
    return this;
  }

  private getEnabledFirstFactorIdentifiers(attributes: Attributes): Array<keyof UserSettingsResource['attributes']> {
    if (!attributes) {
      return [];
    }

    return Object.entries(attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && !name.startsWith('web3'))
      .map(([name]) => name) as Array<keyof UserSettingsResource['attributes']>;
  }

  private getWeb3FirstFactors(attributes: Attributes): Web3Strategy[] {
    if (!attributes) {
      return [];
    }

    return Object.entries(attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && name.startsWith('web3'))
      .map(([, desc]) => desc.first_factors)
      .flat() as any as Web3Strategy[];
  }

  private getSocialProviderStrategies(social: OAuthProviders): OAuthStrategy[] {
    if (!social) {
      return [];
    }

    return Object.entries(social)
      .filter(([, desc]) => desc.enabled)
      .map(([, desc]) => desc.strategy)
      .sort();
  }
}
