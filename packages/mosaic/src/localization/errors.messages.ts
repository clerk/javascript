// TODO: Seed this catalog from the unstable__errors entries in @clerk/localizations so existing copy and translations carry over.
export const errorMessages: { readonly generic: string } & Readonly<Record<string, string>> = {
  generic: 'Something went wrong. Please try again.',
  action_blocked: "This action couldn't be completed. Please try again later or contact support if this persists.",
  avatar_file_count_exceeded: 'Only one file can be uploaded at a time.',
  avatar_file_size_exceeded: 'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
  avatar_file_type_invalid: 'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
  connected_account_unavailable: 'This connected account is no longer available.',
  enterprise_connection_unavailable: 'This enterprise connection is no longer available.',
  form_new_password_matches_current: 'New password cannot be the same as the current password.',
  form_password_incorrect: 'Your current password is incorrect.',
  form_password_length_too_short: 'Your password is too short. It must be at least 8 characters long.',
  form_password_matches_identifier:
    'Password cannot match your email address, phone number or username. For account safety, please use a different password.',
  form_password_not_strong_enough: 'Your password is not strong enough.',
  form_password_pwned:
    'This password has been found as part of a breach and can not be used, please try another password instead.',
  form_password_size_in_bytes_exceeded:
    'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
  form_password_validation_failed: 'Incorrect Password',
  form_username_invalid_length: 'Your username must be between {min_length} and {max_length} characters long.',
  form_username_needs_non_number_char: 'Your username must contain at least one non-numeric character.',
  oauth_missing_verification_url: 'The connection could not start. Please try again.',
};
