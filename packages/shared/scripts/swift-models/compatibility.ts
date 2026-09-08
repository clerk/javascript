import type { SwiftEnum, SwiftProperty, SwiftStruct } from './model';

type PropertyCompatibility = {
  decodeDefault?: string;
  initDefault?: string;
  decode?: string;
  encode?: string;
  required?: boolean;
};

type ModelCompatibility = {
  hashable?: boolean;
  asClass?: boolean;
  rawValueEnum?: boolean;
  enumCases?: SwiftEnum['cases'];
  equalityFields?: string[];
  hashFields?: string[];
  propertyOrder?: string[];
  extraProperties?: (SwiftProperty & { before: string[]; appendOnReplace?: boolean })[];
};

export const PROPERTY_COMPATIBILITY: Record<string, PropertyCompatibility> = {
  'APIKeysSettings.user_api_keys_enabled': { decodeDefault: 'false' },
  'APIKeysSettings.orgs_api_keys_enabled': { decodeDefault: 'false' },
  'APIKeysSettings.id': { decodeDefault: '""' },
  'APIKeysSettings.object': { decodeDefault: '"api_keys_settings"' },
  'Actions.delete_self': { decodeDefault: 'false' },
  'Actions.create_organization': { decodeDefault: 'false' },
  'AttributeData.enabled': { decodeDefault: 'false' },
  'AttributeData.required': { decodeDefault: 'false' },
  'AttributeData.verifications': { decodeDefault: '[]' },
  'AttributeData.used_for_first_factor': { decodeDefault: 'false' },
  'AttributeData.first_factors': { decodeDefault: '[]' },
  'AttributeData.used_for_second_factor': { decodeDefault: 'false' },
  'AttributeData.second_factors': { decodeDefault: '[]' },
  'AttributeData.verify_at_sign_up': { decodeDefault: 'false' },
  'Attributes.email_address': { decodeDefault: '.empty' },
  'Attributes.phone_number': { decodeDefault: '.empty' },
  'Attributes.web3_wallet': { decodeDefault: '.empty' },
  'Attributes.passkey': { decodeDefault: '.empty' },
  'Attributes.username': { decodeDefault: '.empty' },
  'Attributes.password': { decodeDefault: '.empty' },
  'Attributes.backup_code': { decodeDefault: '.empty' },
  'Attributes.first_name': { decodeDefault: '.empty' },
  'Attributes.last_name': { decodeDefault: '.empty' },
  'Attributes.authenticator_app': { decodeDefault: '.empty' },
  'CommerceSettings.billing': { decodeDefault: '.empty' },
  'CommerceSettings.id': { decodeDefault: '""' },
  'CommerceSettings.object': { decodeDefault: '"commerce_settings"' },
  'CommerceSettingsBilling.organization': { decodeDefault: '.empty' },
  'CommerceSettingsBilling.user': { decodeDefault: '.empty' },
  'CommerceSettingsBillingOrganization.enabled': { decodeDefault: 'false' },
  'CommerceSettingsBillingOrganization.has_paid_plans': { decodeDefault: 'false' },
  'DeletedObject.object': { decodeDefault: '"deleted_object"' },
  'DisplayConfig.object': { decodeDefault: '"display_config"' },
  'DisplayConfig.id': { decodeDefault: '""' },
  'DisplayConfig.after_sign_in_url': { decodeDefault: '""' },
  'DisplayConfig.after_sign_out_all_url': { decodeDefault: '""' },
  'DisplayConfig.after_sign_out_one_url': { decodeDefault: '""' },
  'DisplayConfig.after_sign_up_url': { decodeDefault: '""' },
  'DisplayConfig.after_switch_session_url': { decodeDefault: '""' },
  'DisplayConfig.application_name': { decodeDefault: '""' },
  'DisplayConfig.branded': { decodeDefault: 'false' },
  'DisplayConfig.captcha_provider': { decodeDefault: '""' },
  'DisplayConfig.home_url': { decodeDefault: '""' },
  'DisplayConfig.instance_environment_type': { decodeDefault: '""' },
  'DisplayConfig.logo_image_url': { decodeDefault: '""' },
  'DisplayConfig.favicon_image_url': { decodeDefault: '""' },
  'DisplayConfig.preferred_sign_in_strategy': { decodeDefault: '.otp' },
  'DisplayConfig.sign_in_url': { decodeDefault: '""' },
  'DisplayConfig.sign_up_url': { decodeDefault: '""' },
  'DisplayConfig.support_email': { decodeDefault: '""' },
  'DisplayConfig.theme': { decodeDefault: '.empty' },
  'DisplayConfig.user_profile_url': { decodeDefault: '""' },
  'DisplayConfig.organization_profile_url': { decodeDefault: '""' },
  'DisplayConfig.create_organization_url': { decodeDefault: '""' },
  'DisplayConfig.after_leave_organization_url': { decodeDefault: '""' },
  'DisplayConfig.after_create_organization_url': { decodeDefault: '""' },
  'DisplayConfig.show_devmode_warning': { decodeDefault: 'false' },
  'DisplayConfig.terms_url': { decodeDefault: '""' },
  'DisplayConfig.privacy_policy_url': { decodeDefault: '""' },
  'DisplayConfig.waitlist_url': { decodeDefault: '""' },
  'DisplayConfig.after_join_waitlist_url': { decodeDefault: '""' },
  'ClerkEnvironment.api_keys_settings': { decodeDefault: '.empty' },
  'ClerkEnvironment.auth_config': { decodeDefault: 'ClerkEnvironment.empty.authConfig' },
  'ClerkEnvironment.commerce_settings': { decodeDefault: '.empty' },
  'ClerkEnvironment.display_config': { decodeDefault: '.empty' },
  'ClerkEnvironment.maintenance_mode': { decodeDefault: 'false' },
  'ClerkEnvironment.organization_settings': { decodeDefault: '.empty' },
  'ClerkEnvironment.user_settings': { decodeDefault: '.empty' },
  'ClerkEnvironment.protect_config': { decodeDefault: '.empty' },
  'ClerkEnvironment.id': { decodeDefault: '""' },
  'ClerkEnvironment.object': { decodeDefault: '"environment"' },
  'OAuthProviderSettings.enabled': { decodeDefault: 'false' },
  'OAuthProviderSettings.required': { decodeDefault: 'false' },
  'OAuthProviderSettings.authenticatable': { decodeDefault: 'false' },
  'OAuthProviderSettings.strategy': { decodeDefault: '""' },
  'OAuthProviderSettings.name': { decodeDefault: '""' },
  'OAuthProviders.oauth_facebook': { decodeDefault: '.disabled(strategy: "oauth_facebook", name: "Facebook")' },
  'OAuthProviders.oauth_google': { decodeDefault: '.disabled(strategy: "oauth_google", name: "Google")' },
  'OAuthProviders.oauth_hubspot': { decodeDefault: '.disabled(strategy: "oauth_hubspot", name: "HubSpot")' },
  'OAuthProviders.oauth_github': { decodeDefault: '.disabled(strategy: "oauth_github", name: "GitHub")' },
  'OAuthProviders.oauth_tiktok': { decodeDefault: '.disabled(strategy: "oauth_tiktok", name: "TikTok")' },
  'OAuthProviders.oauth_gitlab': { decodeDefault: '.disabled(strategy: "oauth_gitlab", name: "GitLab")' },
  'OAuthProviders.oauth_discord': { decodeDefault: '.disabled(strategy: "oauth_discord", name: "Discord")' },
  'OAuthProviders.oauth_twitter': { decodeDefault: '.disabled(strategy: "oauth_twitter", name: "Twitter")' },
  'OAuthProviders.oauth_twitch': { decodeDefault: '.disabled(strategy: "oauth_twitch", name: "Twitch")' },
  'OAuthProviders.oauth_linkedin': { decodeDefault: '.disabled(strategy: "oauth_linkedin", name: "LinkedIn")' },
  'OAuthProviders.oauth_linkedin_oidc': {
    decodeDefault: '.disabled(strategy: "oauth_linkedin_oidc", name: "LinkedIn")',
  },
  'OAuthProviders.oauth_dropbox': { decodeDefault: '.disabled(strategy: "oauth_dropbox", name: "Dropbox")' },
  'OAuthProviders.oauth_atlassian': { decodeDefault: '.disabled(strategy: "oauth_atlassian", name: "Atlassian")' },
  'OAuthProviders.oauth_bitbucket': { decodeDefault: '.disabled(strategy: "oauth_bitbucket", name: "Bitbucket")' },
  'OAuthProviders.oauth_microsoft': { decodeDefault: '.disabled(strategy: "oauth_microsoft", name: "Microsoft")' },
  'OAuthProviders.oauth_notion': { decodeDefault: '.disabled(strategy: "oauth_notion", name: "Notion")' },
  'OAuthProviders.oauth_apple': { decodeDefault: '.disabled(strategy: "oauth_apple", name: "Apple")' },
  'OAuthProviders.oauth_line': { decodeDefault: '.disabled(strategy: "oauth_line", name: "LINE")' },
  'OAuthProviders.oauth_instagram': { decodeDefault: '.disabled(strategy: "oauth_instagram", name: "Instagram")' },
  'OAuthProviders.oauth_coinbase': { decodeDefault: '.disabled(strategy: "oauth_coinbase", name: "Coinbase")' },
  'OAuthProviders.oauth_spotify': { decodeDefault: '.disabled(strategy: "oauth_spotify", name: "Spotify")' },
  'OAuthProviders.oauth_xero': { decodeDefault: '.disabled(strategy: "oauth_xero", name: "Xero")' },
  'OAuthProviders.oauth_box': { decodeDefault: '.disabled(strategy: "oauth_box", name: "Box")' },
  'OAuthProviders.oauth_slack': { decodeDefault: '.disabled(strategy: "oauth_slack", name: "Slack")' },
  'OAuthProviders.oauth_linear': { decodeDefault: '.disabled(strategy: "oauth_linear", name: "Linear")' },
  'OAuthProviders.oauth_x': { decodeDefault: '.disabled(strategy: "oauth_x", name: "X")' },
  'OAuthProviders.oauth_enstall': { decodeDefault: '.disabled(strategy: "oauth_enstall", name: "Enstall")' },
  'OAuthProviders.oauth_huggingface': {
    decodeDefault: '.disabled(strategy: "oauth_huggingface", name: "Hugging Face")',
  },
  'OAuthProviders.oauth_vercel': { decodeDefault: '.disabled(strategy: "oauth_vercel", name: "Vercel")' },
  'OrganizationSettings.enabled': { decodeDefault: 'false' },
  'OrganizationSettings.max_allowed_memberships': { decodeDefault: '1' },
  'OrganizationSettings.force_organization_selection': { decodeDefault: 'false' },
  'OrganizationSettings.actions': { decodeDefault: '.empty' },
  'OrganizationSettings.domains': { decodeDefault: '.empty' },
  'OrganizationSettings.slug': { decodeDefault: '.empty' },
  'OrganizationSettings.organization_creation_defaults': { decodeDefault: '.empty' },
  'OrganizationSettingsActions.admin_delete': { decodeDefault: 'false' },
  'OrganizationSettingsDomains.enabled': { decodeDefault: 'false' },
  'OrganizationSettingsDomains.enrollment_modes': { decodeDefault: '[]' },
  'OrganizationSettingsOrganizationCreationDefaults.enabled': { decodeDefault: 'false' },
  'OrganizationSettingsSlug.disabled': { decodeDefault: 'false' },
  'SignInDataSecondFactor.required': { decodeDefault: 'false' },
  'SignInDataSecondFactor.enabled': { decodeDefault: 'false' },
  'SignUpData.allowlist_only': { decodeDefault: 'false' },
  'SignUpData.progressive': { decodeDefault: 'false' },
  'SignUpData.captcha_enabled': { decodeDefault: 'false' },
  'SignUpData.mode': { decodeDefault: '.public' },
  'SignUpData.legal_consent_enabled': { decodeDefault: 'false' },
  'UserSettings.attributes': { decodeDefault: '.empty' },
  'UserSettings.actions': { decodeDefault: '.empty' },
  'UserSettings.social': { decodeDefault: '.empty' },
  'UserSettings.enterprise_sso': { decodeDefault: '.empty' },
  'UserSettings.sign_in': { decodeDefault: '.empty' },
  'UserSettings.sign_up': { decodeDefault: '.empty' },
  'UserSettings.password_settings': { decodeDefault: '.empty' },
  'UserSettings.passkey_settings': { decodeDefault: '.empty' },
  'UserSettings.username_settings': { decodeDefault: '.empty' },
  'Client.object': { decodeDefault: '"client"' },
  'Client.sessions': { decodeDefault: '[]' },
  'Client.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Client.updated_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'SignIn.object': { decodeDefault: '"sign_in"' },
  'SignIn.status': { decodeDefault: '.unknown("")' },
  'SignIn.supported_identifiers': { decodeDefault: '[]' },
  'SignIn.identifier': { decodeDefault: '""' },
  'SignIn.user_data': { decodeDefault: 'UserData(imageUrl: "", hasImage: false)' },
  'SignIn.supported_first_factors': { decodeDefault: '[]' },
  'SignIn.supported_second_factors': { decodeDefault: '[]' },
  'SignUp.object': { decodeDefault: '"sign_up"' },
  'SignUp.status': { decodeDefault: '.unknown("")' },
  'SignUp.required_fields': { decodeDefault: '[]' },
  'SignUp.optional_fields': { decodeDefault: '[]' },
  'SignUp.missing_fields': { decodeDefault: '[]' },
  'SignUp.unverified_fields': { decodeDefault: '[]' },
  'SignUp.external_account': { decodeDefault: '.object([:])' },
  'SignUp.has_password': { decodeDefault: 'false' },
  'SignUp.unsafe_metadata': { decodeDefault: '.object([:])' },
  'SignUpVerification.next_action': { decodeDefault: '""' },
  'SignUpVerification.supported_strategies': { decodeDefault: '[]' },
  'SignUpVerification.status': { decodeDefault: '.unverified' },
  'SignUpVerification.verified_at_client': { decodeDefault: '""' },
  'SignUpVerification.strategy': { decodeDefault: '""' },
  'SignUpVerification.attempts': { decodeDefault: '0' },
  'SignUpVerification.expire_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'SignUpVerification.error': { decodeDefault: 'ClerkAPIError(code: "", message: "")' },
  'SignUpVerification.id': { decodeDefault: '""' },
  'SignUpVerification.object': { decodeDefault: '"verification"' },
  'SignUpVerifications.email_address': { decodeDefault: '.empty' },
  'SignUpVerifications.phone_number': { decodeDefault: '.empty' },
  'SignUpVerifications.web3_wallet': { decodeDefault: '.empty' },
  'SignUpVerifications.external_account': { decodeDefault: 'Verification.empty' },
  'Token.object': { decodeDefault: '"token"' },
  'Token.jwt': { decodeDefault: '""' },
  'Token.id': { decodeDefault: '""' },
  'User.object': { decodeDefault: '"user"' },
  'User.image_url': { decodeDefault: '""' },
  'User.has_image': { decodeDefault: 'false' },
  'User.email_addresses': { decodeDefault: '[]' },
  'User.phone_numbers': { decodeDefault: '[]' },
  'User.web3_wallets': { decodeDefault: '[]' },
  'User.external_accounts': { decodeDefault: '[]' },
  'User.enterprise_accounts': { decodeDefault: '[]' },
  'User.passkeys': { decodeDefault: '[]' },
  'User.organization_memberships': { decodeDefault: '[]' },
  'User.password_enabled': { decodeDefault: 'false' },
  'User.profile_image_id': { decodeDefault: '""' },
  'User.totp_enabled': { decodeDefault: 'false' },
  'User.backup_code_enabled': { decodeDefault: 'false' },
  'User.two_factor_enabled': { decodeDefault: 'false' },
  'User.public_metadata': { decodeDefault: '.object([:])' },
  'User.unsafe_metadata': { decodeDefault: '.object([:])' },
  'User.create_organization_enabled': { decodeDefault: 'false' },
  'User.delete_self_enabled': { decodeDefault: 'false' },
  'User.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'User.updated_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'UserData.image_url': { decodeDefault: '""' },
  'UserData.has_image': { decodeDefault: 'false' },
  'Session.object': { decodeDefault: '"session"' },
  'Session.status': { decodeDefault: '.unknown("")' },
  'Session.expire_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Session.abandon_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Session.last_active_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Session.last_active_token': { decodeDefault: '.empty' },
  'Session.user': { decodeDefault: '.empty' },
  'Session.public_user_data': { decodeDefault: '.empty' },
  'Session.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Session.updated_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'EmailAddress.object': { decodeDefault: '"email_address"' },
  'EmailAddress.linked_to': { decodeDefault: '[]' },
  'EmailAddress.matches_sso_connection': { decodeDefault: 'false' },
  'EmailAddress.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'PhoneNumber.object': { decodeDefault: '"phone_number"' },
  'PhoneNumber.reserved_for_second_factor': { decodeDefault: 'false' },
  'PhoneNumber.default_second_factor': { decodeDefault: 'false' },
  'PhoneNumber.linked_to': { decodeDefault: '[]' },
  'PhoneNumber.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'ExternalAccount.object': { decodeDefault: '"external_account"' },
  'ExternalAccount.identification_id': { decodeDefault: '""' },
  'ExternalAccount.provider_user_id': { decodeDefault: '""' },
  'ExternalAccount.approved_scopes': { decodeDefault: '""' },
  'ExternalAccount.email_address': { decodeDefault: '""' },
  'ExternalAccount.first_name': { decodeDefault: '""' },
  'ExternalAccount.last_name': { decodeDefault: '""' },
  'ExternalAccount.image_url': { decodeDefault: '""' },
  'ExternalAccount.username': { decodeDefault: '""' },
  'ExternalAccount.phone_number': { decodeDefault: '""' },
  'ExternalAccount.public_metadata': { decodeDefault: '.object([:])' },
  'ExternalAccount.label': { decodeDefault: '""' },
  'ExternalAccount.created_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Verification.status': { decodeDefault: '.unverified' },
  'Verification.verified_at_client': { decodeDefault: '""' },
  'Verification.strategy': { decodeDefault: '""' },
  'Verification.attempts': { decodeDefault: '0' },
  'Verification.expire_at': { decodeDefault: 'Date(timeIntervalSince1970: 0)' },
  'Verification.error': { decodeDefault: 'ClerkAPIError(code: "", message: "")' },
  'Verification.id': { decodeDefault: '""' },
  'Verification.object': { decodeDefault: '"verification"' },
  'Verification.trusted_device_challenge': {
    decodeDefault: '""',
    initDefault: '""',
    decode: `    if let value = try container.decodeIfPresentFlexible(
      JSONValue.self,
      snake: "trusted_device_challenge",
      camel: "trustedDeviceChallenge"
    ) {
      self.trustedDeviceChallenge = String(data: try value.data(), encoding: .utf8) ?? ""
    } else {
      self.trustedDeviceChallenge = try container.decodeIfPresentFlexible(
        String.self,
        snake: "trusted_device_challenge",
        camel: "trustedDeviceChallenge"
      ) ?? ""
    }`,
    encode: `    if !trustedDeviceChallenge.isEmpty, let data = trustedDeviceChallenge.data(using: .utf8) {
      try container.encode(JSONDecoder().decode(JSONValue.self, from: data), forKey: .trustedDeviceChallenge)
    }`,
  },
  'SessionActivity.id': { decodeDefault: '""' },
  'SessionActivity.object': {
    decodeDefault: '"session_activity"',
    initDefault: '"session_activity"',
  },
  'AuthConfig.single_session_mode': { decodeDefault: 'false' },
  'AuthConfig.reverification': { decodeDefault: 'false' },
  'AuthConfig.session_minter': {
    decodeDefault: 'false',
    initDefault: 'false',
    required: true,
  },
  'AuthConfig.native_settings': {
    decodeDefault: '.default',
    initDefault: '.default',
  },
  'AuthConfig.id': { decodeDefault: '""' },
  'AuthConfig.object': { decodeDefault: '"auth_config"' },
  'ClerkAPIError.code': { decodeDefault: '""' },
  'ClerkAPIError.message': { decodeDefault: '""' },
  'ClerkAPIError.clerk_trace_id': {
    decodeDefault: '""',
    initDefault: '""',
  },
};

export const MODEL_COMPATIBILITY: Record<string, ModelCompatibility> = {
  EmailAddress: {
    hashable: true,
    extraProperties: [
      {
        name: 'createdAt',
        wireName: 'created_at',
        type: {
          kind: 'primitive',
          name: 'Date',
        },
        isDate: true,
        before: ['created_at'],
      },
    ],
  },
  PhoneNumber: {
    hashable: true,
    extraProperties: [
      {
        name: 'createdAt',
        wireName: 'created_at',
        type: {
          kind: 'primitive',
          name: 'Date',
        },
        isDate: true,
        before: ['created_at'],
      },
    ],
  },
  ExternalAccount: {
    hashable: true,
    extraProperties: [
      {
        name: 'createdAt',
        wireName: 'created_at',
        type: {
          kind: 'primitive',
          name: 'Date',
        },
        isDate: true,
        before: ['created_at'],
      },
    ],
  },
  IdentificationLink: {
    hashable: true,
  },
  SessionTask: {
    hashable: true,
  },
  Verification: {
    hashable: true,
    hashFields: [
      'id',
      'status',
      'strategy',
      'nonce',
      'attempts',
      'expireAt',
      'externalVerificationRedirectUrl',
      'trustedDeviceChallenge',
    ],
    extraProperties: [
      {
        name: 'trustedDeviceChallenge',
        wireName: 'trusted_device_challenge',
        type: {
          kind: 'primitive',
          name: 'String',
        },
        isDate: false,
        before: ['created_at'],
        appendOnReplace: true,
      },
    ],
  },
  ClerkAPIError: {
    asClass: true,
    extraProperties: [
      {
        name: 'clerkTraceId',
        wireName: 'clerk_trace_id',
        type: {
          kind: 'primitive',
          name: 'String',
        },
        isDate: false,
        before: ['created_at'],
      },
    ],
  },
  OrganizationEnrollmentMode: {
    rawValueEnum: true,
  },
  SignInIdentifier: {
    enumCases: [
      {
        name: 'passkey',
        raw: 'passkey',
      },
    ],
  },
  SignInSecondFactorStrategy: {
    enumCases: [
      {
        name: 'passkey',
        raw: 'passkey',
      },
    ],
  },
  SessionActivity: {
    equalityFields: [
      'id',
      'object',
      'browserName',
      'browserVersion',
      'deviceType',
      'ipAddress',
      'city',
      'country',
      'isMobile',
    ],
    propertyOrder: ['id', 'object'],
  },
  Session: {
    extraProperties: [
      {
        name: 'latestActivity',
        wireName: 'latest_activity',
        type: {
          kind: 'optional',
          of: {
            kind: 'named',
            name: 'SessionActivity',
          },
        },
        isDate: false,
        before: ['created_at'],
      },
    ],
  },
  AuthConfig: {
    extraProperties: [
      {
        name: 'nativeSettings',
        wireName: 'native_settings',
        type: {
          kind: 'named',
          name: 'NativeSettings',
        },
        isDate: false,
        before: ['created_at', 'id'],
      },
    ],
  },
};

export function structDeclaration(name: string, properties: SwiftProperty[]): SwiftStruct {
  const model = MODEL_COMPATIBILITY[name];
  for (const extra of model?.extraProperties ?? []) {
    const existing = properties.findIndex(property => property.wireName === extra.wireName);
    if (existing >= 0) {
      if (extra.appendOnReplace) {
        properties.splice(existing, 1);
        properties.push(extra);
      } else {
        properties[existing] = extra;
      }
      continue;
    }
    const anchor = extra.before
      .map(wireName => properties.findIndex(property => property.wireName === wireName))
      .find(index => index >= 0);
    properties.splice(anchor ?? properties.length, 0, extra);
  }
  for (const property of properties) {
    if (PROPERTY_COMPATIBILITY[`${name}.${property.wireName}`]?.required && property.type.kind === 'optional') {
      property.type = property.type.of;
    }
  }
  const order = model?.propertyOrder;
  if (order) {
    const rank = (property: SwiftProperty) => {
      const index = order.indexOf(property.wireName);
      return index === -1 ? order.length : index;
    };
    properties.sort((left, right) => rank(left) - rank(right));
  }
  const id = properties.find(property => property.wireName === 'id');
  return {
    kind: 'struct',
    name,
    properties,
    identifiable: id?.type.kind === 'primitive' && id.type.name === 'String',
    asClass: model?.asClass ?? false,
  };
}

export function applyExtraEnumCases(name: string, cases: SwiftEnum['cases']): void {
  for (const extra of MODEL_COMPATIBILITY[name]?.enumCases ?? []) {
    if (!cases.some(item => item.raw === extra.raw)) {
      cases.push(extra);
    }
  }
}
