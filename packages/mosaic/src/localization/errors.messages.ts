export const errorMessages: { readonly generic: string } & Readonly<Record<string, string>> = {
  generic: 'Something went wrong. Please try again.',
  action_blocked: "This action couldn't be completed. Please try again later or contact support if this persists.",
  avatar_file_count_exceeded: 'Only one file can be uploaded at a time.',
  avatar_file_size_exceeded: 'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
  avatar_file_type_invalid: 'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
  form_new_password_matches_current: 'New password cannot be the same as the current password.',
  form_password_length_too_short: 'Your password is too short. It must be at least 8 characters long.',
  form_password_matches_identifier:
    'Password cannot match your email address, phone number or username. For account safety, please use a different password.',
  form_password_not_strong_enough: 'Your password is not strong enough.',
  form_password_pwned:
    'This password has been found as part of a breach and can not be used, please try another password instead.',
  form_username_needs_non_number_char: 'Your username must contain at least one non-numeric character.',
};
