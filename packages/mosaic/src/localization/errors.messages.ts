export const errorMessages: { readonly generic: string } & Readonly<Record<string, string>> = {
  generic: 'Something went wrong. Please try again.',
  action_blocked: "This action couldn't be completed. Please try again later or contact support if this persists.",
  active_device_unavailable: 'This device is no longer available. Please try again.',
  avatar_file_count_exceeded: 'Only one file can be uploaded at a time.',
  avatar_file_size_exceeded: 'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
  avatar_file_type_invalid: 'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
  captcha_unavailable:
    'Sign up unsuccessful due to failed bot validation. Please refresh the page to try again or reach out to support for more assistance.',
  connected_account_unavailable: 'This connected account is no longer available.',
  enterprise_connection_unavailable: 'This enterprise connection is no longer available.',
  form_new_password_matches_current: 'New password cannot be the same as the current password.',
  form_param_format_invalid__email_address: 'Email address must be a valid email address.',
  form_param_format_invalid__phone_number: 'Phone number must be in a valid international format.',
  form_password_incorrect: 'Your current password is incorrect.',
  form_password_length_too_short: 'Your password is too short. It must be at least 8 characters long.',
  form_password_matches_identifier:
    'Password cannot match your email address, phone number or username. For account safety, please use a different password.',
  form_password_not_strong_enough: 'Your password is not strong enough.',
  form_password_pwned:
    'This password has been found as part of a breach and can not be used, please try another password instead.',
  form_password_pwned__sign_in:
    'This password has been found as part of a breach and can not be used, please reset your password.',
  form_password_size_in_bytes_exceeded:
    'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
  form_password_untrusted__sign_in:
    'Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.',
  form_password_validation_failed: 'Incorrect Password',
  form_username_invalid_length: 'Your username must be between {min_length} and {max_length} characters long.',
  form_username_needs_non_number_char: 'Your username must contain at least one non-numeric character.',
  insufficient_seats_change_plan:
    'Your organization does not have enough seats to invite the desired number of members. Please change to a plan that supports the number of members you are attempting to invite.',
  insufficient_seats_contact_support:
    'Your organization does not have enough seats to invite the desired number of members. Please contact support.',
  invitation_unavailable: 'This invitation is no longer pending.',
  member_unavailable: 'This member is no longer available to manage.',
  mfa_account_changed: 'This account changed. Please try again.',
  mfa_authenticator_unavailable: 'Authenticator is unavailable.',
  mfa_method_cannot_remove: 'This method cannot be removed.',
  mfa_phone_unavailable: 'This phone number is unavailable.',
  mfa_print_unavailable: 'Printing is unavailable in this browser.',
  mfa_setup_factor_first: 'Set up a verification method first.',
  network_error: 'Unable to reach the server. Check your connection and try again.',
  oauth_access_denied: 'You did not grant access to your account.',
  oauth_missing_verification_url: 'The connection could not start. Please try again.',
  organization_invitation_not_pending: 'This invitation is no longer pending.',
  organization_membership_quota_exceeded:
    'You have reached your limit of organization memberships, including outstanding invitations.',
  organization_not_found_or_unauthorized:
    'You are no longer a member of this organization. Please choose or create another one.',
  organization_not_found_or_unauthorized_with_create_organization_disabled:
    'You are no longer a member of this organization. Please choose another one.',
  request_unavailable: 'This request is no longer pending.',
  passkey_already_exists: 'A passkey is already registered with this device.',
  passkey_not_supported: 'Passkeys are not supported on this device.',
  passkey_pa_not_supported: 'Registration requires a platform authenticator but the device does not support it.',
  passkey_registration_cancelled: 'Passkey registration was cancelled or timed out.',
  passkey_retrieval_cancelled: 'Passkey verification was cancelled or timed out.',
  protect_check_execution_failed: "Verification didn't complete. Please try again.",
  protect_check_invalid_script: "Couldn't load verification. Please contact support if this persists.",
  protect_check_invalid_sdk_url: "Verification couldn't start. Please contact support.",
  protect_check_required:
    "This sign-in needs an extra verification step that can't be shown here. Please try again or use a different sign-in method.",
  protect_check_script_load_failed:
    "Couldn't load verification. This may be caused by a network issue or a Content Security Policy that blocks the verification script. Please try again or contact support.",
  protect_check_timed_out: "Verification didn't complete in time. Please try again.",
  protect_check_unsupported_environment:
    "Verification isn't supported in this environment. Please continue in a standard browser or contact support.",
  role_unavailable: 'This role is no longer available.',
  sso_bypass_domain_not_served:
    'This member could not be added because their email address is not served by a connection.',
  ticket_expired_code: 'This link has expired. Please start again or request a new link.',
  ticket_invalid_code:
    'This link is no longer valid or has already been used. Please start again or request a new link.',
  token_creation_conflict: 'API Key name already exists.',
  token_quota_exceeded: 'You have reached your usage limit. You can remove the limit by upgrading to a paid plan.',
  too_many_unverified_identifications:
    'Too many verifications are pending on this account. Remove an unverified email address, phone number, or wallet you no longer need, or wait a few minutes for an incomplete passkey setup to expire, then try again.',
  web3_missing_identifier: 'A Web3 Wallet extension cannot be found. Please install one to continue.',
  web3_provider_unavailable: 'This wallet provider is unavailable.',
  web3_wallet_creation_failed: 'The wallet could not be created.',
  web3_verification_message_unavailable: 'The wallet verification message is unavailable.',
  web3_signature_unavailable: 'The wallet signature is unavailable.',
  web3_signature_request_rejected: 'You have rejected the signature request. Please try again to continue.',
  web3_solana_signature_generation_failed:
    'An error occurred while generating the signature. Please try again to continue.',
};
