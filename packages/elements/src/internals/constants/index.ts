import type { SignUpModes } from '@clerk/shared/types';

import { safeAccess } from '~/utils/safe-access';

export const SSO_CALLBACK_PATH_ROUTE = '/sso-callback';
export const CHOOSE_SESSION_PATH_ROUTE = '/choose';
export const MAGIC_LINK_VERIFY_PATH_ROUTE = '/verify';

export const SIGN_UP_MODES: Record<string, SignUpModes> = {
  PUBLIC: 'public',
  RESTRICTED: 'restricted',
};

// TODO: remove reliance on next-specific variables here
export const SIGN_IN_DEFAULT_BASE_PATH = safeAccess(
  () => process.env.CLERK_SIGN_IN_URL ?? process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  '/sign-in',
);
export const SIGN_UP_DEFAULT_BASE_PATH = safeAccess(
  () => process.env.CLERK_SIGN_UP_URL ?? process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  '/sign-up',
);

// The version that Next added support for the window.history.pushState and replaceState APIs.
// ref: https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate
export const NEXT_WINDOW_HISTORY_SUPPORT_VERSION = '14.1.0';

export const SEARCH_PARAMS = {
  createdSession: '__clerk_created_session',
  handshake: '__clerk_handshake',
  help: '__clerk_help',
  invitationToken: '__clerk_invitation_token',
  modalState: '__clerk_modal_state',
  satelliteUrl: '__clerk_satellite_url',
  status: '__clerk_status',
  synced: '__clerk_synced',
  ticket: '__clerk_ticket',
  transfer: '__clerk_transfer',
} as const;

export const RESENDABLE_COUNTDOWN_DEFAULT = 60;

export const CAPTCHA_ELEMENT_ID = 'clerk-captcha';

// Pulled from: https://github.com/clerk/javascript/blob/c7d626292a9fd12ca0f1b31a1035e711b6e99531/packages/clerk-js/src/core/constants.ts#L15
export const ERROR_CODES = {
  FORM_IDENTIFIER_NOT_FOUND: 'form_identifier_not_found',
  FORM_PASSWORD_INCORRECT: 'form_password_incorrect',
  INVALID_STRATEGY_FOR_USER: 'strategy_for_user_invalid',
  NOT_ALLOWED_TO_SIGN_UP: 'not_allowed_to_sign_up',
  OAUTH_ACCESS_DENIED: 'oauth_access_denied',
  OAUTH_EMAIL_DOMAIN_RESERVED_BY_SAML: 'oauth_email_domain_reserved_by_saml',
  NOT_ALLOWED_ACCESS: 'not_allowed_access',
  SAML_USER_ATTRIBUTE_MISSING: 'saml_user_attribute_missing',
  USER_LOCKED: 'user_locked',
  ENTERPRISE_SSO_USER_ATTRIBUTE_MISSING: 'enterprise_sso_user_attribute_missing',
  ENTERPRISE_SSO_EMAIL_ADDRESS_DOMAIN_MISMATCH: 'enterprise_sso_email_address_domain_mismatch',
  ENTERPRISE_SSO_HOSTED_DOMAIN_MISMATCH: 'enterprise_sso_hosted_domain_mismatch',
  SAML_EMAIL_ADDRESS_DOMAIN_MISMATCH: 'saml_email_address_domain_mismatch',
  ORGANIZATION_MEMBERSHIP_QUOTA_EXCEEDED_FOR_SSO: 'organization_membership_quota_exceeded_for_sso',
};

export const ROUTING = {
  path: 'path',
  virtual: 'virtual',
  hash: 'hash',
} as const;

export type ROUTING = (typeof ROUTING)[keyof typeof ROUTING];
