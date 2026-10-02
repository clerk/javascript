export const errorMessages: { readonly generic: string } & Readonly<Record<string, string>> = {
  generic: 'Something went wrong. Please try again.',
  form_new_password_matches_current: 'New password cannot be the same as the current password.',
  form_password_incorrect: 'Your current password is incorrect.',
  form_password_matches_identifier:
    'Password cannot match your email address, phone number or username. For account safety, please use a different password.',
  form_password_pwned:
    'This password has been found as part of a breach and can not be used, please try another password instead.',
  form_password_size_in_bytes_exceeded:
    'Your password has exceeded the maximum number of bytes allowed, please shorten it or remove some special characters.',
  form_password_validation_failed: 'Incorrect Password',
};
