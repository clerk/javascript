import type { SignUpModes } from '../../types';

// TODO: Do we still have a use for this or can we simply preserve all params?
export const PRESERVED_QUERYSTRING_PARAMS = [
  'redirect_url',
  'after_sign_in_url',
  'after_sign_up_url',
  'sign_in_force_redirect_url',
  'sign_in_fallback_redirect_url',
  'sign_up_force_redirect_url',
  'sign_up_fallback_redirect_url',
];

export const CLERK_MODAL_STATE = '__clerk_modal_state';
export const CLERK_SYNCED = '__clerk_synced';
export const CLERK_SYNCED_STATUS = {
  /** Not synced - satellite needs handshake after returning from primary sign-in */
  NeedsSync: 'false',
  /** Sync completed - prevents re-sync loop after handshake completes */
  Completed: 'true',
} as const;
export const CLERK_SUFFIXED_COOKIES = 'suffixed_cookies';
export const CLERK_SATELLITE_URL = '__clerk_satellite_url';
export const ERROR_CODES = {
  FORM_IDENTIFIER_NOT_FOUND: 'form_identifier_not_found',
  FORM_PASSWORD_INCORRECT: 'form_password_incorrect',
  FORM_PASSWORD_PWNED: 'form_password_pwned',
  INVALID_STRATEGY_FOR_USER: 'strategy_for_user_invalid',
  NOT_ALLOWED_TO_SIGN_UP: 'not_allowed_to_sign_up',
  OAUTH_ACCESS_DENIED: 'oauth_access_denied',
  OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML: 'oauth_email_domain_reserved_by_saml',
  NOT_ALLOWED_ACCESS: 'not_allowed_access',
  SAML_USER_ATTRIBUTE_MISSING: 'saml_user_attribute_missing',
  USER_LOCKED: 'user_locked',
  EXTERNAL_ACCOUNT_NOT_FOUND: 'external_account_not_found',
  SESSION_EXISTS: 'session_exists',
  SIGN_UP_MODE_RESTRICTED: 'sign_up_mode_restricted',
  SIGN_UP_MODE_RESTRICTED_WAITLIST: 'sign_up_restricted_waitlist',
  ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING: 'enterprise_sso_user_attribute_missing',
  ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH: 'enterprise_sso_email_address_domain_mismatch',
  ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH: 'enterprise_sso_hosted_domain_mismatch',
  SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH: 'saml_email_address_domain_mismatch',
  INVITATION_ACCOUNT_NOT_EXISTS: 'invitation_account_not_exists',
  ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO: 'organization_membership_quota_exceeded_for_sso',
  CAPTCHA_INVALID: 'captcha_invalid',
  FRAUD_DEVICE_BLOCKED: 'device_blocked',
  FRAUD_ACTION_BLOCKED: 'action_blocked',
  SIGNUP_RATE_LIMIT_EXCEEDED: 'signup_rate_limit_exceeded',
  USER_BANNED: 'user_banned',
} as const;

export const SIGN_IN_INITIAL_VALUE_KEYS = ['email_address', 'phone_number', 'username'];
export const SIGN_UP_INITIAL_VALUE_KEYS = ['email_address', 'phone_number', 'username', 'first_name', 'last_name'];

export const DEBOUNCE_MS = 350;

export const SIGN_UP_MODES = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
  WAITLIST: 'waitlist',
} satisfies Record<string, SignUpModes>;

// This is the currently supported version of the Frontend API
export const SUPPORTED_FAPI_VERSION = '2025-11-10';

export const CAPTCHA_ELEMENT_ID = 'clerk-captcha';
export const CAPTCHA_INVISIBLE_CLASSNAME = 'clerk-invisible-captcha';
