export const PRESERVED_QUERYSTRING_PARAMS = ['after_sign_in_url', 'after_sign_up_url', 'redirect_url'];

export const DEV_BROWSER_SSO_JWT_KEY = 'clerk-db-jwt';
export const DEV_BROWSER_SSO_JWT_PARAMETER = '__dev_session';
export const DEV_BROWSER_SSO_JWT_HTTP_HEADER = 'Clerk-Cookie';

export const CLERK_MODAL_STATE = '__clerk_modal_state';
/**
 * @deprecated This will be removed in the next minor version
 */
export const CLERK_REFERRER_PRIMARY = '__clerk_referrer_primary';
export const CLERK_SYNCED = '__clerk_synced';
export const CLERK_SATELLITE_URL = '__clerk_satellite_url';
export const ERROR_CODES = {
  FORM_IDENTIFIER_NOT_FOUND: 'form_identifier_not_found',
  FORM_PASSWORD_INCORRECT: 'form_password_incorrect',
  INVALID_STRATEGY_FOR_USER: 'strategy_for_user_invalid',
  NOT_ALLOWED_TO_SIGN_UP: 'not_allowed_to_sign_up',
  OAUTH_ACCESS_DENIED: 'oauth_access_denied',
  OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML: 'oauth_email_domain_reserved_by_saml',
  NOT_ALLOWED_ACCESS: 'not_allowed_access',
  SAML_USER_ATTRIBUTE_MISSING: 'saml_user_attribute_missing',
};
