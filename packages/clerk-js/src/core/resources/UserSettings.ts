import type {
  Attributes,
  EnterpriseSSOSettings,
  OAuthProviders,
  OAuthStrategy,
  PasskeySettingsData,
  PasswordSettingsData,
  SamlSettings,
  SignInData,
  SignUpData,
  UsernameSettingsData,
  UserSettingsJSON,
  UserSettingsJSONSnapshot,
  UserSettingsResource,
  Web3Strategy,
} from '@clerk/types';

import { BaseResource } from './internal';

const defaultMaxPasswordLength = 72;
const defaultMinPasswordLength = 8;

const defaultMinUsernameLength = 4;
const defaultMaxUsernameLength = 64;

export type Actions = {
  create_organization: boolean;
  delete_self: boolean;
};

/**
 * @internal
 */
export class UserSettings extends BaseResource implements UserSettingsResource {
  id = undefined;

  // @ts-expect-error - This is a partial object, but we want to ensure that all actions are present.
  actions: Partial<Actions> = {};
  // @ts-expect-error - This is a partial object, but we want to ensure that all attributes are present.
  attributes: Partial<Attributes> = {};
  enterpriseSSO: EnterpriseSSOSettings = {} as EnterpriseSSOSettings;
  passkeySettings: PasskeySettingsData = {} as PasskeySettingsData;
  passwordSettings: PasswordSettingsData = {} as PasswordSettingsData;
  saml: SamlSettings = {} as SamlSettings;
  signIn: SignInData = {} as SignInData;
  signUp: SignUpData = {} as SignUpData;
  social: OAuthProviders = {} as OAuthProviders;
  usernameSettings: UsernameSettingsData = {} as UsernameSettingsData;

  get authenticatableSocialStrategies(): OAuthStrategy[] {
    if (!this.social) {
      return [];
    }

    return Object.entries(this.social)
      .filter(([, desc]) => desc.enabled && desc.authenticatable)
      .map(([, desc]) => desc.strategy)
      .sort();
  }

  get enabledFirstFactorIdentifiers(): Array<keyof UserSettingsResource['attributes']> {
    if (!this.attributes) {
      return [];
    }

    return Object.entries(this.attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && !name.startsWith('web3'))
      .map(([name]) => name) as Array<keyof UserSettingsResource['attributes']>;
  }

  get socialProviderStrategies(): OAuthStrategy[] {
    if (!this.social) {
      return [];
    }

    return Object.entries(this.social)
      .filter(([, desc]) => desc.enabled)
      .map(([, desc]) => desc.strategy)
      .sort();
  }

  get web3FirstFactors(): Web3Strategy[] {
    if (!this.attributes) {
      return [];
    }

    return Object.entries(this.attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && name.startsWith('web3'))
      .map(([, desc]) => desc.first_factors)
      .flat() as any as Web3Strategy[];
  }

  /**
   * Constructor now accepts an optional data object.
   */
  public constructor(data: UserSettingsJSON | UserSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  get instanceIsPasswordBased() {
    return Boolean(this.attributes?.password?.enabled && this.attributes.password?.required);
  }

  get hasValidAuthFactor() {
    return Boolean(
      this.attributes?.email_address?.enabled ||
        this.attributes?.phone_number?.enabled ||
        (this.attributes.password?.required && this.attributes.username?.required),
    );
  }

  /**
   * fromJSON now safely returns the instance even if null is provided.
   */
  protected fromJSON(data: UserSettingsJSON | UserSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.attributes = Object.fromEntries(
      Object.entries(data.attributes).map(a => [a[0], { ...a[1], name: a[0] }]),
    ) as Attributes;
    this.actions = data.actions;
    this.enterpriseSSO = data.enterprise_sso;
    this.passkeySettings = data.passkey_settings;
    this.passwordSettings = {
      ...data.password_settings,
      min_length: Math.max(data.password_settings?.min_length ?? defaultMinPasswordLength, defaultMinPasswordLength),
      max_length:
        data.password_settings?.max_length === 0
          ? defaultMaxPasswordLength
          : Math.min(data.password_settings?.max_length ?? defaultMaxPasswordLength, defaultMaxPasswordLength),
    };
    this.saml = data.saml;
    this.signIn = data.sign_in;
    this.signUp = data.sign_up;
    this.social = data.social;
    this.usernameSettings = {
      ...data.username_settings,
      min_length: Math.max(data.username_settings?.min_length ?? defaultMinUsernameLength, defaultMinUsernameLength),
      max_length: Math.min(data.username_settings?.max_length ?? defaultMaxUsernameLength, defaultMaxUsernameLength),
    };

    return this;
  }

  public __internal_toSnapshot(): UserSettingsJSONSnapshot {
    return {
      social: this.social,
      saml: this.saml,
      attributes: this.attributes,
      actions: this.actions,
      sign_in: this.signIn,
      sign_up: this.signUp,
      password_settings: this.passwordSettings,
      passkey_settings: this.passkeySettings,
    } as unknown as UserSettingsJSONSnapshot;
  }
}
