import type {
  Attributes,
  EnterpriseSSOSettings,
  OAuthProviders,
  OAuthStrategy,
  PasskeySettingsData,
  PasswordSettingsData,
  PhoneCodeChannel,
  SamlSettings,
  SignInData,
  SignUpData,
  UsernameSettingsData,
  UserSettingsJSON,
  UserSettingsJSONSnapshot,
  UserSettingsResource,
  Web3Strategy,
} from '@clerk/shared/types';

import { BaseResource } from './internal';

const defaultMaxPasswordLength = 72;
const defaultMinPasswordLength = 8;

const defaultMinUsernameLength = 4;
const defaultMaxUsernameLength = 64;

export type Actions = {
  create_organization: boolean;
  delete_self: boolean;
};

const DISABLED_ATTRIBUTE = {
  enabled: false,
  first_factors: [],
  name: 'phone_number',
  required: false,
  second_factors: [],
  used_for_first_factor: false,
  used_for_second_factor: false,
  verifications: [],
  verify_at_sign_up: false,
};

/**
 * @internal
 */
export class UserSettings extends BaseResource implements UserSettingsResource {
  id = undefined;

  actions: Actions = { create_organization: false, delete_self: false };
  attributes: Attributes = {
    email_address: {
      enabled: true,
      first_factors: ['email_code'],
      name: 'email_address',
      required: true,
      second_factors: [],
      used_for_first_factor: true,
      used_for_second_factor: false,
      verifications: ['email_code'],
      verify_at_sign_up: true,
    },
    phone_number: {
      ...DISABLED_ATTRIBUTE,
      name: 'phone_number',
    },
    username: {
      ...DISABLED_ATTRIBUTE,
      name: 'username',
    },
    web3_wallet: {
      ...DISABLED_ATTRIBUTE,
      name: 'web3_wallet',
    },
    first_name: {
      ...DISABLED_ATTRIBUTE,
      name: 'first_name',
    },
    last_name: {
      ...DISABLED_ATTRIBUTE,
      name: 'last_name',
    },
    password: {
      enabled: true,
      first_factors: [],
      name: 'password',
      required: true,
      second_factors: [],
      used_for_first_factor: false,
      used_for_second_factor: false,
      verifications: [],
      verify_at_sign_up: false,
    },
    authenticator_app: {
      ...DISABLED_ATTRIBUTE,
      name: 'authenticator_app',
    },
    backup_code: {
      ...DISABLED_ATTRIBUTE,
      name: 'backup_code',
    },
    passkey: {
      ...DISABLED_ATTRIBUTE,
      name: 'passkey',
    },
  };
  enterpriseSSO: EnterpriseSSOSettings = {
    enabled: false,
  };
  passkeySettings: PasskeySettingsData = {
    allow_autofill: false,
    show_sign_in_button: false,
  };
  passwordSettings: PasswordSettingsData = {} as PasswordSettingsData;
  saml: SamlSettings = {
    enabled: false,
  };
  signIn: SignInData = {
    second_factor: {
      required: false,
      enabled: false,
    },
  };
  signUp: SignUpData = {
    allowlist_only: false,
    captcha_enabled: false,
    legal_consent_enabled: false,
    mode: 'public',
    progressive: true,
  };
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

  get alternativePhoneCodeChannels(): PhoneCodeChannel[] {
    if (!this.attributes) {
      return [];
    }

    return Object.entries(this.attributes)
      .filter(([name, attr]) => attr.used_for_first_factor && name === 'phone_number')
      .map(([, desc]) => desc?.channels?.filter(factor => factor !== 'sms') || [])
      .flat() as any as PhoneCodeChannel[];
  }

  public constructor(data: UserSettingsJSON | UserSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  get instanceIsPasswordBased() {
    return Boolean(this.attributes?.password?.enabled);
  }

  get hasValidAuthFactor() {
    return Boolean(
      this.attributes?.email_address?.enabled ||
        this.attributes?.phone_number?.enabled ||
        (this.attributes.password?.enabled &&
          (this.attributes?.email_address?.enabled ||
            this.attributes?.phone_number?.enabled ||
            this.attributes?.username?.enabled)),
    );
  }

  protected fromJSON(data: UserSettingsJSON | UserSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.attributes = this.withDefault(
      data.attributes
        ? (Object.fromEntries(Object.entries(data.attributes).map(a => [a[0], { ...a[1], name: a[0] }])) as Attributes)
        : null,
      this.attributes,
    );
    this.actions = this.withDefault(data.actions, this.actions);
    this.enterpriseSSO = this.withDefault(data.enterprise_sso, this.enterpriseSSO);
    this.passkeySettings = this.withDefault(data.passkey_settings, this.passkeySettings);
    this.passwordSettings = data.password_settings
      ? {
          ...data.password_settings,
          min_length: Math.max(
            data.password_settings?.min_length ?? defaultMinPasswordLength,
            defaultMinPasswordLength,
          ),
          max_length:
            data.password_settings?.max_length === 0
              ? defaultMaxPasswordLength
              : Math.min(data.password_settings?.max_length ?? defaultMaxPasswordLength, defaultMaxPasswordLength),
        }
      : this.passwordSettings;
    this.saml = this.withDefault(data.saml, this.saml);
    this.signIn = this.withDefault(data.sign_in, this.signIn);
    this.signUp = this.withDefault(data.sign_up, this.signUp);
    this.social = this.withDefault(data.social, this.social);
    this.usernameSettings = data.username_settings
      ? {
          ...data.username_settings,
          min_length: Math.max(
            data.username_settings?.min_length ?? defaultMinUsernameLength,
            defaultMinUsernameLength,
          ),
          max_length: Math.min(
            data.username_settings?.max_length ?? defaultMaxUsernameLength,
            defaultMaxUsernameLength,
          ),
        }
      : this.usernameSettings;

    return this;
  }

  public __internal_toSnapshot(): UserSettingsJSONSnapshot {
    return {
      actions: this.actions,
      attributes: this.attributes,
      passkey_settings: this.passkeySettings,
      password_settings: this.passwordSettings,
      saml: this.saml,
      sign_in: this.signIn,
      sign_up: this.signUp,
      social: this.social,
    } as unknown as UserSettingsJSONSnapshot;
  }
}
