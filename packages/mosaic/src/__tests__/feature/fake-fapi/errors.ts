import { HttpResponse } from 'msw';

interface FapiErrorEntry {
  status: number;
  message: string;
  longMessage: string;
}

const FAPI_ERRORS = {
  action_blocked: { status: 403, message: 'Action blocked', longMessage: 'Action blocked' },
  action_for_session_not_authorized: {
    status: 401,
    message: 'Unauthorized action for session',
    longMessage: 'Not authorized to perform requested action on session sess_1',
  },
  already_a_member_in_organization: {
    status: 400,
    message: 'already a member',
    longMessage: 'user@example.com is already a member of the organization.',
  },
  bulk_size_exceeded: {
    status: 400,
    message: 'bulk size exceeded',
    longMessage: 'Parameters exceed the maximum allowed bulk processing size of 10.',
  },
  enterprise_sso_account_already_connected: {
    status: 400,
    message: 'Already connected',
    longMessage: 'An enterprise account is already connected for this connection email: user@example.com',
  },
  enterprise_sso_additional_identifications_disabled: {
    status: 422,
    message: 'Identifications creation disabled by your enterprise account',
    longMessage: 'You cannot create identifications because your enterprise account does not allow it.',
  },
  external_account_missing_refresh_token: {
    status: 400,
    message: 'Missing refresh token',
    longMessage:
      "We cannot refresh your OAuth access token because the server didn't provide a refresh token. Please re-connect your account.",
  },
  feature_not_enabled: {
    status: 403,
    message: 'not enabled',
    longMessage: 'This feature is not enabled on this instance',
  },
  form_code_incorrect: { status: 422, message: 'is incorrect', longMessage: 'Incorrect code' },
  form_identifier_exists: {
    status: 422,
    message: 'That identifier is taken. Please try another.',
    longMessage: 'That identifier is taken. Please try another.',
  },
  form_param_format_invalid: {
    status: 422,
    message: 'is invalid',
    longMessage: 'email_address must be a valid email address.',
  },
  form_param_max_length_exceeded: {
    status: 422,
    message: 'exceeds maximum length',
    longMessage: 'Name should not exceed 256 characters.',
  },
  form_param_missing: { status: 422, message: 'is missing', longMessage: 'name must be included.' },
  form_param_unknown: {
    status: 422,
    message: 'is unknown',
    longMessage: 'name is not a valid parameter for this request.',
  },
  form_param_value_invalid: {
    status: 422,
    message: 'is invalid',
    longMessage: 'value does not match one of the allowed values for parameter name',
  },
  form_password_incorrect: {
    status: 422,
    message: 'Password is incorrect. Try again, or use another method.',
    longMessage: 'Password is incorrect. Try again, or use another method.',
  },
  form_password_pwned: {
    status: 422,
    message: 'Password has been found in an online data breach. For account safety, please use a different password.',
    longMessage:
      'Password has been found in an online data breach. For account safety, please use a different password.',
  },
  form_resource_not_found: {
    status: 422,
    message: 'is missing',
    longMessage: 'The resource associated with the supplied id was not found.',
  },
  identification_deletion_failed: {
    status: 400,
    message: 'Deletion failed',
    longMessage: 'You cannot delete your last identification.',
  },
  identification_update_second_factor_unverified: {
    status: 400,
    message: 'Update failed',
    longMessage: 'Cannot update second factor attributes for unverified identification',
  },
  internal_clerk_error: {
    status: 500,
    message: 'Oops, an unexpected error occurred',
    longMessage: "There was an internal error on our servers. We've been notified and are working on fixing it.",
  },
  invalid_action_for_session: {
    status: 400,
    message: 'Invalid action for user session',
    longMessage: 'Unable to revoke session sess_1',
  },
  invalid_action_for_session_reverification: {
    status: 400,
    message: 'Invalid action for session reverification',
    longMessage: "We were unable to attempt verification for this session, as it's not ready for verification.",
  },
  missing_organization_permission: {
    status: 403,
    message: 'missing permission',
    longMessage: 'Current user is missing an organization permission.',
  },
  not_a_member_in_organization: {
    status: 403,
    message: 'not a member',
    longMessage: 'Current user is not a member of the organization. Only organization members can perform this action.',
  },
  oauth_provider_not_enabled: {
    status: 400,
    message: 'GitHub OAuth provider not enabled',
    longMessage: 'Single-sign on with GitHub OAuth provider is not enabled in the instance settings.',
  },
  organization_invitation_not_pending: {
    status: 404,
    message: 'not pending',
    longMessage: "The organization invitation is not in the 'pending' status.",
  },
  organization_membership_quota_exceeded: {
    status: 403,
    message: 'organization membership quota exceeded',
    longMessage: 'You have reached your limit of 5 organization memberships, including outstanding invitations.',
  },
  organization_minimum_permissions_needed: {
    status: 400,
    message: 'minimum organization permissions needed',
    longMessage: 'There has to be at least one organization member with the minimum required permissions',
  },
  passkey_quota_exceeded: {
    status: 403,
    message: 'passkey quota exceeded',
    longMessage: 'You have reached your limit of 10 passkeys per account.',
  },
  request_body_invalid: {
    status: 400,
    message: 'Image decode error',
    longMessage: 'The image could not be decoded. Please ensure the image is valid and try again.',
  },
  resource_forbidden: { status: 403, message: 'forbidden', longMessage: 'Resource forbidden' },
  resource_not_found: { status: 404, message: 'not found', longMessage: 'Resource not found' },
  second_factor_deletion_not_allowed: {
    status: 400,
    message: 'second factor deletion not allowed',
    longMessage: 'You are required to maintain at least one two-step verification method in your account at all times',
  },
  session_reverification_missing: {
    status: 400,
    message: 'is missing',
    longMessage: 'You need to start a new session verification flow first',
  },
  session_reverification_required: {
    status: 403,
    message: 'Reverification required',
    longMessage: 'You need to provide additional verification to perform this operation',
  },
  token_creation_conflict: {
    status: 409,
    message: 'Token creation conflict',
    longMessage: 'A token with the same name and subject already exists.',
  },
  token_quota_exceeded: {
    status: 403,
    message: 'Token quota exceeded',
    longMessage: 'You have reached your usage limit. You can remove the limit by upgrading to a paid plan.',
  },
  verification_expired: {
    status: 400,
    message: 'expired',
    longMessage: 'This verification has expired. You must create a new one.',
  },
  verification_not_sent: {
    status: 400,
    message: 'not sent',
    longMessage: 'You need to send a verification code before attempting to verify.',
  },
} as const satisfies Record<string, FapiErrorEntry>;

export type FapiErrorCode = keyof typeof FAPI_ERRORS;

export interface FapiErrorOptions {
  longMessage?: string;
  paramName?: string;
  meta?: Record<string, unknown>;
}

export function fapiErrorStatus(code: FapiErrorCode): number {
  return FAPI_ERRORS[code].status;
}

export function fapiErrorJSON(code: FapiErrorCode, { longMessage, paramName, meta }: FapiErrorOptions = {}) {
  const entry = FAPI_ERRORS[code];
  const errorMeta = { ...(paramName ? { param_name: paramName } : {}), ...meta };
  return {
    code,
    message: entry.message,
    long_message: longMessage ?? entry.longMessage,
    ...(Object.keys(errorMeta).length > 0 ? { meta: errorMeta } : {}),
  };
}

export function fapiError(code: FapiErrorCode, options?: FapiErrorOptions) {
  return HttpResponse.json({ errors: [fapiErrorJSON(code, options)] }, { status: fapiErrorStatus(code) });
}
